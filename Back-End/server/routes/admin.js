const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Review = require('../models/Review');
const User = require('../models/user');

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aaaservicesdirectory@gmail.com',
    pass: 'qggwfeapxfsqtlxo'
  }
});

// Middleware to verify admin token
const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('🔍 Backend: authenticateAdmin middleware - Request headers:', req.headers);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔍 Backend: Token extracted:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('🔍 Backend: No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('🔍 Backend: Token decoded:', decoded);
    
    // Check if it's an admin token
    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId);
      console.log('🔍 Backend: Admin found:', admin ? { id: admin._id, username: admin.username, status: admin.status } : 'Not found');
      
      if (!admin || admin.status !== 'active') {
        console.log('🔍 Backend: Admin not found or inactive');
        return res.status(401).json({ message: 'Access denied. Invalid token.' });
      }

      req.admin = admin;
      req.userType = 'admin';
      console.log('🔍 Backend: Admin authenticated successfully:', admin.username);
      next();
    }
    else {
      console.log('🔍 Backend: Invalid token structure');
      return res.status(401).json({ message: 'Access denied. Invalid token structure.' });
    }
  } catch (error) {
    console.error('🔍 Backend: Authentication error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};



// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ message: 'Invalid credentials or account inactive' });
    }

    // Check if password is set
    if (!admin.isPasswordSet) {
      return res.status(401).json({ message: 'Password not set. Please contact administrator.' });
    }

    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        profilePicture: admin.profilePicture,
        phone: admin.phone,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard stats
router.get('/dashboard-stats', authenticateAdmin, async (req, res) => {
  try {
    const totalBusinesses = await Business.countDocuments();
    const pendingBusinesses = await Business.countDocuments({ status: 'pending' });
    const activeBusinesses = await Business.countDocuments({ status: 'active' });
    const totalReviews = await Review.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get user counts by type
    const customerUsers = await User.countDocuments({ userType: 'customer' });
    const businessUsers = await User.countDocuments({ userType: 'business' });
    const adminUsers = await User.countDocuments({ userType: 'admin' });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });
    
    // Get complaints count
    const Complaint = require('../models/Complaint');
    const totalComplaints = await Complaint.countDocuments();

    res.json({
      totalBusinesses,
      pendingBusinesses,
      activeBusinesses,
      totalReviews,
      totalUsers,
      totalComplaints,
      customerUsers,
      businessUsers,
      adminUsers,
      verifiedUsers,
      unverifiedUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get all service providers (businesses)
router.get('/service-providers', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const businesses = await Business.find(query)
      .populate('owner', 'firstName lastName email emailVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Debug: Log the first business to see what's being populated
    if (businesses.length > 0) {
      console.log('🔍 Backend: First business owner data:', {
        businessId: businesses[0]._id,
        businessName: businesses[0].businessName,
        owner: businesses[0].owner ? {
          id: businesses[0].owner._id,
          firstName: businesses[0].owner.firstName,
          lastName: businesses[0].owner.lastName,
          email: businesses[0].owner.email,
          emailVerified: businesses[0].owner.emailVerified
        } : 'No owner'
      });
      
      // Debug: Direct query to check the user data
      if (businesses[0].owner) {
        const directUser = await User.findById(businesses[0].owner._id).select('firstName lastName email emailVerified');
        console.log('🔍 Backend: Direct user query result:', {
          id: directUser._id,
          firstName: directUser.firstName,
          lastName: directUser.lastName,
          email: directUser.email,
          emailVerified: directUser.emailVerified
        });
      }
    }

    const total = await Business.countDocuments(query);

    res.json({
      businesses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get service providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all complaints for admin dashboard
router.get('/complaints', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔍 GET /api/admin/complaints - Admin requesting complaints');
    console.log('🔍 Query parameters:', req.query);
    console.log('🔍 Admin making request:', req.admin._id, req.admin.username, req.admin.role);
    
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      severity,
      serviceCategory,
      businessId,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    // Apply filters
    if (status && status !== 'all') query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (serviceCategory) query.serviceCategory = serviceCategory;
    if (businessId) query.businessId = businessId;
    if (userId) query.userId = userId;

    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    console.log('🔍 Pagination:', { page, limit, skip });

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population for admin dashboard
    const Complaint = require('../models/Complaint');
    const complaints = await Complaint.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('businessId', 'businessName businessType location contact')
      .populate('adminNotes.adminId', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('🔍 Found complaints:', complaints.length);
    if (complaints.length > 0) {
      console.log('🔍 First complaint sample:', {
        id: complaints[0]._id,
        title: complaints[0].title,
        status: complaints[0].status,
        userEmail: complaints[0].userEmail
      });
    }

    // Get total count for pagination
    const total = await Complaint.countDocuments(query);
    console.log('🔍 Total complaints in database:', total);

    // Get statistics for admin dashboard
    const stats = await Complaint.getStats();
    console.log('🔍 Complaint stats:', stats);

    res.json({
      success: true,
      complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComplaints: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update business status
router.patch('/service-providers/:id/status', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔍 Backend: PATCH /service-providers/:id/status - Request received');
    console.log('🔍 Backend: Request params:', req.params);
    console.log('🔍 Backend: Request body:', req.body);
    console.log('🔍 Backend: Admin user:', req.admin._id);
    
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'pending', 'suspended', 'rejected', 'inactive'].includes(status)) {
      console.log('🔍 Backend: Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status' });
    }

    console.log('🔍 Backend: Updating business:', id, 'to status:', status);
    
    const business = await Business.findByIdAndUpdate(
      id,
      { 
        status,
        statusReason: reason,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.admin._id
      },
      { new: true }
    );

    if (!business) {
      console.log('🔍 Backend: Business not found:', id);
      return res.status(404).json({ message: 'Business not found' });
    }

    console.log('🔍 Backend: Business status updated successfully:', business._id, '->', business.status);
    res.json({ message: 'Status updated successfully', business });
  } catch (error) {
    console.error('🔍 Backend: Update business status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete business
router.delete('/service-providers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const business = await Business.findByIdAndDelete(id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Also delete associated reviews
    await Review.deleteMany({ business: id });

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews
router.get('/reviews', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .populate('reviewer', 'firstName lastName email')
      .populate('business', 'businessName businessType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review status
router.patch('/reviews/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'hidden', 'flagged', 'deleted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { 
        status,
        adminNotes: reason,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.admin._id
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review status updated successfully', review });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status
router.patch('/complaints/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['pending', 'under_review', 'investigating', 'resolved', 'closed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const Complaint = require('../models/Complaint');
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        status,
        $push: {
          adminNotes: {
            adminId: req.admin._id,
            note: note || `Status changed to ${status}`,
            timestamp: new Date()
          }
        },
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.admin._id
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint status updated successfully', complaint });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve complaint
router.patch('/complaints/:id/resolve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { actionTaken, resolutionNote } = req.body;

    const Complaint = require('../models/Complaint');
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        status: 'resolved',
        resolution: {
          actionTaken,
          description: resolutionNote,
          resolvedAt: new Date(),
          resolvedBy: req.admin._id
        },
        $push: {
          adminNotes: {
            adminId: req.admin._id,
            note: `Complaint resolved: ${actionTaken}`,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Populate the complaint with business information for email
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('businessId', 'businessName businessType location');

    // Send resolution email to the user
    if (populatedComplaint.userEmail) {
      try {
        console.log('🔍 Attempting to send resolution email to:', populatedComplaint.userEmail);
        console.log('🔍 Complaint data for email:', {
          title: populatedComplaint.title,
          businessName: populatedComplaint.businessId?.businessName,
          serviceCategory: populatedComplaint.serviceCategory,
          userEmail: populatedComplaint.userEmail
        });

        const resolutionEmail = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
              .resolution-details { background: #e8f5e9; padding: 15px; margin: 15px 0; border-radius: 8px; }
              .complaint-info { background: #f0f8ff; padding: 15px; margin: 15px 0; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>✅ Your Complaint Has Been Resolved!</h2>
              </div>
              <div class="content">
                <p>Dear User,</p>
                <p>Great news! Your complaint has been successfully resolved by our team.</p>
                
                <div class="complaint-info">
                  <h3>Complaint Details:</h3>
                  <p><strong>Title:</strong> ${populatedComplaint.title}</p>
                  <p><strong>Business:</strong> ${populatedComplaint.businessId?.businessName || 'N/A'}</p>
                  <p><strong>Service Category:</strong> ${populatedComplaint.serviceCategory}</p>
                  <p><strong>Reference Number:</strong> CP-${populatedComplaint._id.toString().slice(-6)}</p>
                </div>
                
                <div class="resolution-details">
                  <h3>Resolution Details:</h3>
                  <p><strong>Action Taken:</strong> ${actionTaken}</p>
                  ${resolutionNote ? `<p><strong>Additional Notes:</strong> ${resolutionNote}</p>` : ''}
                  <p><strong>Resolved On:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p>We appreciate your patience and cooperation throughout this process. If you have any questions or concerns about the resolution, please don't hesitate to contact us.</p>
                <p>Thank you for helping us maintain quality standards.</p>
              </div>
              <div class="footer">
                <p>Sent from AAA Services Directory</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const mailOptions = {
          from: 'aaaservicesdirectory@gmail.com',
          to: populatedComplaint.userEmail,
          subject: `✅ Complaint Resolved - ${populatedComplaint.title}`,
          html: resolutionEmail
        };

        console.log('🔍 Mail options prepared:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject
        });

        const emailResult = await transporter.sendMail(mailOptions);
        console.log('🔍 Resolution email sent successfully to:', populatedComplaint.userEmail);
        console.log('🔍 Email result:', emailResult);
      } catch (emailError) {
        console.error('❌ Error sending resolution email:', emailError);
        console.error('❌ Email error details:', {
          message: emailError.message,
          code: emailError.code,
          stack: emailError.stack
        });
        // Don't fail the request if email fails
      }
    } else {
      console.log('⚠️ No user email found for complaint:', complaint._id);
    }

    res.json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add admin note to complaint
router.post('/complaints/:id/notes', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const Complaint = require('../models/Complaint');
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        $push: {
          adminNotes: {
            adminId: req.admin._id,
            note,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Note added successfully', complaint });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination and filtering
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, status, search } = req.query;
    
    let query = {};
    
    if (userType && userType !== 'all') {
      query.userType = userType;
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'verified') {
        query.emailVerified = true;
      } else if (status === 'unverified') {
        query.emailVerified = false;
      }
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.patch('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, isActive, emailVerified, userType } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (userType !== undefined) updateData.userType = userType;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has associated businesses
    const businessCount = await Business.countDocuments({ owner: id });
    if (businessCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user. User has associated businesses. Please delete businesses first.' 
      });
    }

    // Check if user has associated reviews
    const reviewCount = await Review.countDocuments({ reviewer: id });
    if (reviewCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user. User has associated reviews. Please delete reviews first.' 
      });
    }

    // Send deletion notification email
    try {
      const deletionEmail = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ Account Deletion Notice</h2>
            </div>
            <div class="content">
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>Your account has been permanently deleted from AAA Services Directory by an administrator.</p>
              
              <div class="warning">
                <h3>Important Information:</h3>
                <p><strong>Account ID:</strong> ${user._id}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>User Type:</strong> ${user.userType}</p>
                <p><strong>Deletion Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>This action is irreversible. All your data, including profile information, preferences, and account settings, has been permanently removed from our system.</p>
              
              <p>If you believe this deletion was made in error, please contact our support team immediately.</p>
              
              <p>Thank you for using AAA Services Directory.</p>
            </div>
            <div class="footer">
              <p>Sent from AAA Services Directory</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: 'aaaservicesdirectory@gmail.com',
        to: user.email,
        subject: '⚠️ Account Deletion Notice - AAA Services Directory',
        html: deletionEmail
      };

      await transporter.sendMail(mailOptions);
      console.log('Deletion notification email sent to:', user.email);
    } catch (emailError) {
      console.error('Error sending deletion notification email:', emailError);
      // Don't fail the deletion if email fails
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateAdmin, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

// Get all admin users with pagination and filtering
router.get('/admin-users', authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can manage other admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Only super administrators can manage admin users.' });
    }

    const { page = 1, limit = 10, search = '', role = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    // Get total count
    const total = await Admin.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get admin users
    const adminUsers = await Admin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -passwordResetToken -passwordResetExpires');

    res.json({
      adminUsers,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new admin user
router.post('/admin-users', authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can add other admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Only super administrators can add admin users.' });
    }

    const { username, email, fullName, role } = req.body;

    // Validate required fields
    if (!username || !email || !fullName || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if username already exists
    const existingUsername = await Admin.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create admin user
    const adminUser = new Admin({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      fullName,
      role,
      createdBy: req.admin._id
    });

    await adminUser.save();

    // Generate password setup token
    const resetToken = adminUser.generatePasswordResetToken();
    await adminUser.save();

    // Send password setup email
    const passwordSetupEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #228B22; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #228B22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info { background: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #228B22; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Welcome to AAA Services Directory</h2>
          </div>
          <div class="content">
            <p>Dear ${fullName},</p>
            <p>Welcome! You have been added as an administrator to the AAA Services Directory admin panel.</p>
            
            <div class="info">
              <h3>Your Account Details:</h3>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <p>To get started, you need to set up your password. Click the button below to set your password:</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup-password?token=${resetToken}" class="button">
              Set Your Password
            </a>
            
            <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
            
            <p>After setting your password, you can log in at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/login">Admin Login Page</a></p>
            
            <p>If you have any questions or need assistance, please contact the administrator.</p>
            
            <p>Best regards,<br>AAA Services Directory Team</p>
          </div>
          <div class="footer">
            <p>Sent from AAA Services Directory</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: 'aaaservicesdirectory@gmail.com',
      to: email,
      subject: '🔐 Welcome to AAA Services Directory - Set Your Password',
      html: passwordSetupEmail
    };

    await transporter.sendMail(mailOptions);
    console.log('Password setup email sent to:', email);

    // Return admin user data (without sensitive information)
    const adminData = adminUser.toJSON();
    res.status(201).json({
      message: 'Admin user added successfully',
      adminUser: adminData
    });
  } catch (error) {
    console.error('Add admin user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin user
router.patch('/admin-users/:id', authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can update other admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Only super administrators can update admin users.' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.passwordResetToken;
    delete updateData.passwordResetExpires;

    // Check if admin user exists
    const adminUser = await Admin.findById(id);
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Update admin user
    const updatedAdminUser = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    res.json({
      message: 'Admin user updated successfully',
      adminUser: updatedAdminUser
    });
  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete admin user
router.delete('/admin-users/:id', authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can delete other admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Only super administrators can delete admin users.' });
    }

    const { id } = req.params;

    // Check if admin user exists
    const adminUser = await Admin.findById(id);
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Prevent deletion of superadmin accounts
    if (adminUser.role === 'super_admin') {
      return res.status(400).json({ message: 'Cannot delete superadmin accounts' });
    }

    // Prevent self-deletion
    if (id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Send deletion notification email
    try {
      const deletionEmail = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ Admin Account Deletion Notice</h2>
            </div>
            <div class="content">
              <p>Dear ${adminUser.fullName},</p>
              <p>Your admin account has been permanently deleted from AAA Services Directory by a super administrator.</p>
              
              <div class="warning">
                <h3>Important Information:</h3>
                <p><strong>Account ID:</strong> ${adminUser._id}</p>
                <p><strong>Username:</strong> ${adminUser.username}</p>
                <p><strong>Email:</strong> ${adminUser.email}</p>
                <p><strong>Role:</strong> ${adminUser.role}</p>
                <p><strong>Deletion Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>This action is irreversible. All your access to the admin panel has been permanently removed.</p>
              
              <p>If you believe this deletion was made in error, please contact the super administrator immediately.</p>
              
              <p>Thank you for your service.</p>
            </div>
            <div class="footer">
              <p>Sent from AAA Services Directory</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: 'aaaservicesdirectory@gmail.com',
        to: adminUser.email,
        subject: '⚠️ Admin Account Deletion Notice - AAA Services Directory',
        html: deletionEmail
      };

      await transporter.sendMail(mailOptions);
      console.log('Deletion notification email sent to:', adminUser.email);
    } catch (emailError) {
      console.error('Error sending deletion notification email:', emailError);
      // Don't fail the deletion if email fails
    }

    // Delete the admin user
    await Admin.findByIdAndDelete(id);

    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Delete admin user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin profile (self)
router.patch('/profile', authenticateAdmin, async (req, res) => {
  try {
    const { fullName, email, phone, profilePicture } = req.body;
    const adminId = req.admin._id;
    
    // Check if admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    // Check if email is already taken by another admin
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    
    // Update profile
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { 
        fullName, 
        email, 
        phone, 
        profilePicture,
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      admin: updatedAdmin 
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Validate admin setup token
router.get('/admin-users/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('🔍 Validating admin token:', token);

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Find admin by token
    const adminUser = await Admin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    console.log('🔍 Admin user found:', adminUser ? 'Yes' : 'No');
    if (adminUser) {
      console.log('🔍 Token expires at:', new Date(adminUser.passwordResetExpires));
      console.log('🔍 Current time:', new Date());
      console.log('🔍 Token valid:', adminUser.passwordResetExpires > Date.now());
    }

    if (!adminUser) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Return admin user info (without sensitive data)
    res.json({
      message: 'Token valid',
      adminUser: {
        id: adminUser._id,
        fullName: adminUser.fullName,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Validate admin token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin password setup
router.post('/admin-users/setup-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log('🔍 Setting up password for admin token:', token);

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Find admin by token
    const adminUser = await Admin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    console.log('🔍 Admin user found for password setup:', adminUser ? 'Yes' : 'No');

    if (!adminUser) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash and set password, and activate the account
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update directly in database to avoid pre-save middleware issues
    await Admin.updateOne(
      { _id: adminUser._id },
      {
        $set: {
          password: hashedPassword,
          isPasswordSet: true,
          status: 'active',
          passwordResetToken: null,
          passwordResetExpires: null
        }
      }
    );

    console.log('🔍 Password set successfully for admin user:', adminUser.username);
    console.log('🔍 Admin user status set to active');

    res.json({ message: 'Password set successfully' });
  } catch (error) {
    console.error('Setup admin password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
