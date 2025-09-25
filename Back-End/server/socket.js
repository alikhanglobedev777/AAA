const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// Store connected users
const connectedUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Socket.IO middleware for authentication
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.userType = user.userType;
    socket.user = user;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize Socket.IO
const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId} (${socket.userType})`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    userSockets.set(socket.id, socket.userId);
    
    console.log(`📊 Total connected users: ${connectedUsers.size}`);
    console.log(`📊 Connected user IDs:`, Array.from(connectedUsers.keys()));

    // Add error handler for this socket
    socket.on('error', (error) => {
      console.error('❌ Socket error for user:', socket.userId, error);
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle user joining business room (for business owners)
    if (socket.userType === 'business') {
      socket.on('join-business', async (businessId) => {
        try {
          const Business = require('./models/Business');
          const business = await Business.findOne({ owner: socket.userId });
          
          if (business && business._id.toString() === businessId) {
            socket.join(`business_${businessId}`);
            console.log(`🏢 Business owner ${socket.userId} joined business room: ${businessId}`);
          }
        } catch (error) {
          console.error('Error joining business room:', error);
        }
      });
    }

    // Handle sending messages
    socket.on('send-message', async (data) => {
      if (!data) {
        console.warn('⚠️ send-message received null data from user:', socket.userId);
        socket.emit('message-error', { message: 'Invalid message data' });
        return;
      }
      
      try {
        const { receiverId, businessId, content, messageType = 'text', attachments = [] } = data;
        
        console.log(`📨 Message from ${socket.userId} to ${receiverId}:`, content);

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          socket.emit('message-error', { message: 'Receiver not found' });
          return;
        }

        // Find or create conversation
        // Always use customerId as first parameter to maintain consistent conversation IDs
        let conversation;
        if (socket.user.userType === 'business') {
          // If business owner is sending, we need to find conversation by customerId
          // We'll need to get the customer ID from the business or conversation
          conversation = await Conversation.findOne({ 
            businessId, 
            businessOwner: socket.userId 
          });
          
          if (!conversation) {
            // Create new conversation with customer as first participant
            conversation = await Conversation.findOrCreateConversation(receiverId, businessId);
          }
        } else {
          // If customer is sending, use normal flow
          conversation = await Conversation.findOrCreateConversation(socket.userId, businessId);
        }
        
        console.log(`🔍 Conversation found/created:`, {
          conversationId: conversation.conversationId,
          senderType: socket.user.userType,
          senderId: socket.userId,
          receiverId: receiverId,
          businessId: businessId
        });
        
        // Create message
        const message = new Message({
          conversationId: conversation.conversationId,
          sender: socket.userId,
          receiver: receiverId,
          businessId,
          content,
          messageType,
          attachments
        });

        await message.save();

        // Update conversation
        await conversation.updateLastMessage(message._id, content);
        await conversation.incrementUnreadCount(receiverId);

        // Populate message for sending
        await message.populate('sender', 'firstName lastName profilePicture userType');
        await message.populate('receiver', 'firstName lastName profilePicture userType');
        await message.populate('businessId', 'businessName businessType images.logo');

        // Emit to sender (confirmation)
        socket.emit('message-sent', {
          message,
          conversationId: conversation.conversationId
        });

        // Emit to receiver
        const receiverSocketId = connectedUsers.get(receiverId);
        console.log(`🔍 Sending message to receiver: ${receiverId}`);
        console.log(`🔍 Receiver socket ID: ${receiverSocketId}`);
        console.log(`🔍 Connected users:`, Array.from(connectedUsers.keys()));
        console.log(`🔍 Receiver user type: ${receiver.userType}`);
        console.log(`🔍 Sender user type: ${socket.user.userType}`);
        
        if (receiverSocketId) {
          console.log(`✅ Emitting message to receiver socket: ${receiverSocketId}`);
          io.to(receiverSocketId).emit('new-message', {
            message,
            conversationId: conversation.conversationId,
            sender: socket.user
          });
          
          // Removed duplicate emission to personal room to prevent duplicate messages
        } else {
          console.log(`⚠️ Receiver ${receiverId} is not connected to socket`);
          console.log(`⚠️ This might cause the message to not be delivered in real-time`);
        }

        // Emit to business room if receiver is business owner
        if (receiver.userType === 'business') {
          io.to(`business_${businessId}`).emit('business-message', {
            message,
            conversationId: conversation.conversationId,
            sender: socket.user
          });
        }

        console.log(`✅ Message sent successfully: ${message._id}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { 
          message: 'Failed to send message',
          error: error.message 
        });
      }
    });

    // Handle message read status
    socket.on('mark-read', async (data) => {
      if (!data) {
        console.warn('⚠️ mark-read received null data from user:', socket.userId);
        socket.emit('mark-read-error', { message: 'Invalid data' });
        return;
      }
      
      try {
        const { messageId, conversationId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('mark-read-error', { message: 'Message not found' });
          return;
        }

        // Only mark as read if user is the receiver
        if (message.receiver.toString() === socket.userId) {
          await message.markAsRead();
          
          // Reset unread count for this conversation
          const conversation = await Conversation.findOne({ conversationId });
          if (conversation) {
            await conversation.resetUnreadCount(socket.userId);
          }

          // Notify sender that message was read
          const senderSocketId = connectedUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-read', {
              messageId,
              conversationId,
              readBy: socket.userId,
              readAt: message.readAt
            });
          }

          socket.emit('mark-read-success', { messageId, conversationId });
        }

      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('mark-read-error', { 
          message: 'Failed to mark message as read',
          error: error.message 
        });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      if (!data) {
        console.warn('⚠️ typing-start received null data from user:', socket.userId);
        return;
      }
      
      const { receiverId, businessId, conversationId } = data;
      
      if (!receiverId) {
        console.warn('⚠️ typing-start missing receiverId from user:', socket.userId);
        return;
      }
      
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId: socket.userId,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
          businessId,
          conversationId
        });
      }
    });

    socket.on('typing-stop', (data) => {
      if (!data) {
        console.warn('⚠️ typing-stop received null data from user:', socket.userId);
        return;
      }
      
      const { receiverId, businessId, conversationId } = data;
      
      if (!receiverId) {
        console.warn('⚠️ typing-stop missing receiverId from user:', socket.userId);
        return;
      }
      
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-stopped-typing', {
          userId: socket.userId,
          businessId,
          conversationId
        });
      }
    });

    // Handle user status (online/offline)
    socket.on('user-status', (status) => {
      // Broadcast user status to all connected users
      socket.broadcast.emit('user-status-change', {
        userId: socket.userId,
        status,
        userType: socket.userType
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.id);
      
      console.log(`📊 Total connected users after disconnect: ${connectedUsers.size}`);
      console.log(`📊 Remaining connected user IDs:`, Array.from(connectedUsers.keys()));
      
      // Broadcast user offline status
      socket.broadcast.emit('user-status-change', {
        userId: socket.userId,
        status: 'offline',
        userType: socket.userType
      });
    });
  });

  return io;
};

// Helper function to get connected users
const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Helper function to send notification to specific user
const sendNotificationToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    const io = require('./server').io; // Get io instance from server
    io.to(socketId).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getConnectedUsers,
  isUserOnline,
  sendNotificationToUser
};
