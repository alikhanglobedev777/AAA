const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// GET /api/messaging/conversations - Get user's conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Conversation.getUserConversations(userId);
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// POST /api/messaging/conversations/:businessId/start - Start a new conversation
router.post('/conversations/:businessId/start', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.userId;
    
    console.log(`🔍 Starting conversation: user ${userId} with business ${businessId}`);
    
    // Find or create conversation
    const conversation = await Conversation.findOrCreateConversation(userId, businessId);
    
    console.log(`✅ Conversation ${conversation.conversationId} ready`);
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error.message
    });
  }
});

// GET /api/messaging/conversations/:conversationId/messages - Get conversation messages
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    
    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({ 
      conversationId,
      participants: userId 
    });
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Get messages
    const messages = await Message.getConversationMessages(conversationId, userId);
    
    res.json({
      success: true,
      messages: messages.reverse() // Show oldest first
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// POST /api/messaging/mark-read - Mark message as read
router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { messageId, conversationId } = req.body;
    const userId = req.user.userId;
    
    console.log(`🔍 Marking message as read: ${messageId}, conversation: ${conversationId}, user: ${userId}`);
    
    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Mark message as read
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Only mark as read if user is the receiver
    if (message.receiver.toString() === userId.toString()) {
      await message.markAsRead();
      
      // Reset unread count for this conversation
      await conversation.resetUnreadCount(userId);
      
      console.log(`✅ Message ${messageId} marked as read by user ${userId}`);
      
      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'You can only mark messages you received as read'
      });
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// GET /api/messaging/unread-count - Get total unread messages count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all conversations for user
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    });
    
    // Calculate total unread count
    let unreadCount = 0;
    conversations.forEach(conv => {
      if (conv.customer.toString() === userId.toString()) {
        unreadCount += conv.unreadCount.customer || 0;
      } else if (conv.businessOwner.toString() === userId.toString()) {
        unreadCount += conv.unreadCount.businessOwner || 0;
      }
    });
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// DELETE /api/messaging/conversations/:conversationId - Delete conversation for user
router.delete('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    
    console.log(`🔍 Deleting conversation: ${conversationId} for user: ${userId}`);
    
    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({ 
      conversationId,
      participants: userId 
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Soft delete all messages in this conversation for this user
    const messages = await Message.find({ conversationId });
    await Promise.all(
      messages.map(msg => msg.softDeleteForUser(userId))
    );
    
    console.log(`✅ Conversation ${conversationId} deleted for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
});

module.exports = router;
