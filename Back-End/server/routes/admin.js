const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendMail } = require('../services/emailService');

const router = express.Router();

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Admin authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ message: 'Invalid admin account' });
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  const admin = await Admin.findOne(email ? { email: email.toLowerCase() } : { username: username?.toLowerCase() });

  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  if (admin.status !== 'active') {
    return res.status(403).json({ message: 'Admin account is not active' });
  }

  admin.lastLogin = new Date();
  await admin.save();
  const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, admin });
});

router.get('/admin-users', authenticateAdmin, async (req, res) => {
  const { page, limit, skip } = pageInfo(req.query);
  const query = {};
  if (req.query.role && req.query.role !== 'all') query.role = req.query.role;
  if (req.query.search) query.$or = [{ username: regexFor(req.query.search) }, { email: regexFor(req.query.search) }];
  const [admins, total] = await Promise.all([
    Admin.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select('-password -passwordResetToken -passwordResetExpires'),
    Admin.countDocuments(query),
  ]);
  res.json({ admins, adminUsers: admins, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

router.post('/admin-users', authenticateAdmin, async (req, res) => {
  if (!req.admin.permissions?.manageAdmins) {
    return res.status(403).json({ message: 'You do not have permission to manage admins' });
  }

  const { username, email, fullName, role = 'admin', permissions } = req.body;
  if (!username || !email || !fullName) {
    return res.status(400).json({ message: 'Username, email, and full name are required' });
  }

  if (await Admin.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })) {
    return res.status(400).json({ message: 'An admin with this username or email already exists' });
  }

  const admin = new Admin({
    username,
    email,
    fullName,
    role,
    permissions,
    status: 'pending',
    createdBy: req.admin._id,
  });
  const setupToken = admin.generatePasswordResetToken();
  await admin.save();

  const setupUrl = `${process.env.FRONTEND_URL}/admin/setup-password?token=${setupToken}`;
  await sendMail({
    to: admin.email,
    subject: 'Set up your AAA Services admin account',
    html: `<p>Hello ${admin.fullName},</p><p>You have been invited to the AAA Services admin panel.</p><p><a href="${setupUrl}">Set your password</a></p><p>This link expires in 24 hours.</p>`,
  });

  res.status(201).json({ message: 'Admin invitation sent', admin });
});

router.get('/admin-users/validate-token/:token', async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const admin = await Admin.findOne({
    passwordResetToken: { $in: [req.params.token, hashedToken] },
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!admin) return res.status(400).json({ message: 'Invalid or expired setup token' });
  res.json({ valid: true, adminUser: { email: admin.email, fullName: admin.fullName } });
});

router.post('/admin-users/setup-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    return res.status(400).json({ message: 'A valid token and password of at least 6 characters are required' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const admin = await Admin.findOne({
    passwordResetToken: { $in: [token, hashedToken] },
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!admin) return res.status(400).json({ message: 'Invalid or expired setup token' });

  await admin.hashPassword(password);
  await admin.save();
  res.json({ message: 'Admin password set successfully' });
});

// Administrative data APIs. These endpoints use Admin JWTs, never self-declared User roles.
const Business = require('../models/Business');
const User = require('../models/user');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');

const asyncAdmin = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const pageInfo = (query) => {
  const page = Math.max(1, Math.min(100000, Number.parseInt(query.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};
const regexFor = (value) => new RegExp(String(value).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
const validId = (id) => mongoose.isValidObjectId(id);
const permitted = (permission) => (req, res, next) => {
  if (req.admin.role === 'super_admin' || req.admin.permissions?.[permission]) return next();
  return res.status(403).json({ message: 'Insufficient admin permissions' });
};

router.get('/dashboard-stats', authenticateAdmin, permitted('viewAnalytics'), asyncAdmin(async (req, res) => {
  const [totalBusinesses, pendingBusinesses, activeBusinesses, totalReviews, totalUsers,
    customerUsers, businessUsers, verifiedUsers, totalComplaints, demoBusinesses, demoUsers] = await Promise.all([
    Business.countDocuments(), Business.countDocuments({ status: 'pending' }),
    Business.countDocuments({ status: 'active' }), Review.countDocuments(), User.countDocuments(),
    User.countDocuments({ userType: 'customer' }), User.countDocuments({ userType: 'business' }),
    User.countDocuments({ isVerified: true, tags: { $ne: 'AAA_DEMO_SEED_V2' } }), Complaint.countDocuments(),
    Business.countDocuments({ tags: 'AAA_DEMO_SEED_V2' }),
    User.countDocuments({ tags: 'AAA_DEMO_SEED_V2' }),
  ]);
  res.json({ totalBusinesses, pendingBusinesses, activeBusinesses, totalReviews,
    totalUsers, customerUsers, businessUsers, verifiedUsers, totalComplaints,
    demoBusinesses, demoUsers, nonDemoBusinesses: totalBusinesses - demoBusinesses });
}));

router.get('/service-providers', authenticateAdmin, permitted('manageServiceProviders'), asyncAdmin(async (req, res) => {
  const { page, limit, skip } = pageInfo(req.query);
  const { status, businessType, location, search } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (businessType && businessType !== 'all') query.businessType = businessType;
  if (location) query['location.city'] = regexFor(location);
  if (search) query.$or = [
    { businessName: regexFor(search) }, { description: regexFor(search) },
    { 'location.city': regexFor(search) },
  ];
  const [businesses, total] = await Promise.all([
    Business.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('owner', 'firstName lastName email userType isActive')
      .select('-verification.documents').lean(),
    Business.countDocuments(query),
  ]);
  res.json({ businesses, totalPages: Math.max(1, Math.ceil(total / limit)),
    totalBusinesses: total, pagination: { page, limit, total } });
}));

router.patch('/service-providers/:id/status', authenticateAdmin, permitted('manageServiceProviders'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid business ID' });
  const { status, reason = '' } = req.body || {};
  if (!['active', 'inactive', 'pending', 'suspended', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid business status' });
  }
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ message: 'Business not found' });
  business.status = status;
  business.statusReason = String(reason).slice(0, 500);
  business.statusUpdatedAt = new Date();
  // Do not auto-verify a listing just because it was activated.
  await business.save();
  res.json({ message: 'Business status updated', business });
}));

router.delete('/service-providers/:id', authenticateAdmin, permitted('manageServiceProviders'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid business ID' });
  const business = await Business.findByIdAndUpdate(req.params.id,
    { $set: { status: 'inactive', statusReason: 'Removed from public directory by admin', statusUpdatedAt: new Date() } },
    { new: true });
  if (!business) return res.status(404).json({ message: 'Business not found' });
  res.json({ message: 'Business removed from public directory (soft delete)', business });
}));

router.get('/users', authenticateAdmin, permitted('manageAdmins'), asyncAdmin(async (req, res) => {
  const { page, limit, skip } = pageInfo(req.query);
  const query = {};
  if (req.query.userType && req.query.userType !== 'all') query.userType = req.query.userType;
  if (req.query.status === 'active') query.isActive = true;
  if (req.query.status === 'inactive') query.isActive = false;
  if (req.query.search) query.$or = [
    { firstName: regexFor(req.query.search) }, { lastName: regexFor(req.query.search) },
    { email: regexFor(req.query.search) },
  ];
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select('-password -resetToken -emailVerificationToken -resetTokenExpiry -emailVerificationExpiry').lean(),
    User.countDocuments(query),
  ]);
  res.json({ users, totalPages: Math.max(1, Math.ceil(total / limit)), totalUsers: total });
}));

router.patch('/users/:id', authenticateAdmin, permitted('manageAdmins'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
  const allowed = ['firstName', 'lastName', 'phone', 'isActive', 'emailVerified'];
  const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => allowed.includes(k)));
  if (Object.keys(changes).length === 0) return res.status(400).json({ message: 'No supported changes supplied' });
  const user = await User.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true })
    .select('-password -resetToken -emailVerificationToken');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User updated', user });
}));

router.delete('/users/:id', authenticateAdmin, permitted('manageAdmins'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true })
    .select('-password -resetToken -emailVerificationToken');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deactivated (soft delete)', user });
}));

router.get('/reviews', authenticateAdmin, permitted('manageReviews'), asyncAdmin(async (req, res) => {
  const { page, limit, skip } = pageInfo(req.query);
  const query = {};
  if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
  if (req.query.search) query.comment = regexFor(req.query.search);
  const [reviews, total] = await Promise.all([
    Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('reviewer', 'firstName lastName email').populate('business', 'businessName businessType').lean(),
    Review.countDocuments(query),
  ]);
  res.json({ reviews, totalPages: Math.max(1, Math.ceil(total / limit)), totalReviews: total });
}));

router.patch('/reviews/:id/status', authenticateAdmin, permitted('manageReviews'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID' });
  const { status, reason } = req.body || {};
  if (!['active', 'hidden', 'flagged', 'deleted'].includes(status)) return res.status(400).json({ message: 'Invalid review status' });
  const review = await Review.findByIdAndUpdate(req.params.id, { $set: {
    status, adminNotes: String(reason || '').slice(0, 500), statusUpdatedAt: new Date(),
  } }, { new: true });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json({ message: 'Review status updated', review });
}));

router.get('/complaints', authenticateAdmin, permitted('manageComplaints'), asyncAdmin(async (req, res) => {
  const { page, limit, skip } = pageInfo(req.query);
  const query = {};
  if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
  if (req.query.search) query.$or = [{ title: regexFor(req.query.search) }, { description: regexFor(req.query.search) }];
  const [complaints, total] = await Promise.all([
    Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('businessId', 'businessName businessType').populate('userId', 'firstName lastName email').lean(),
    Complaint.countDocuments(query),
  ]);
  res.json({ success: true, complaints, pagination: { currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), totalComplaints: total } });
}));

router.patch('/complaints/:id/status', authenticateAdmin, permitted('manageComplaints'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid complaint ID' });
  const { status } = req.body || {};
  if (!['pending', 'under_review', 'investigating', 'resolved', 'closed', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid complaint status' });
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ success: true, complaint });
}));

router.post('/complaints/:id/notes', authenticateAdmin, permitted('manageComplaints'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid complaint ID' });
  const note = String(req.body?.note || '').trim();
  if (!note || note.length > 2000) return res.status(400).json({ message: 'Invalid note' });
  const complaint = await Complaint.findByIdAndUpdate(req.params.id,
    { $push: { adminNotes: { note, adminId: req.admin._id, timestamp: new Date() } } }, { new: true });
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ success: true, complaint });
}));

router.patch('/complaints/:id/resolve', authenticateAdmin, permitted('manageComplaints'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid complaint ID' });
  const description = String(req.body?.description || req.body?.resolution || '').trim();
  if (!description || description.length > 2000) return res.status(400).json({ message: 'Resolution description required (max 2000 characters)' });
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $set: {
    status: 'resolved', resolution: { description, resolvedBy: req.admin._id, resolvedAt: new Date() },
  } }, { new: true });
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ success: true, complaint });
}));

router.get('/profile', authenticateAdmin, asyncAdmin(async (req, res) => res.json(req.admin)));
router.patch('/profile', authenticateAdmin, asyncAdmin(async (req, res) => {
  const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => ['fullName', 'phone', 'profilePicture'].includes(key)));
  Object.assign(req.admin, changes);
  await req.admin.save();
  res.json({ success: true, admin: req.admin });
}));
router.put('/profile', authenticateAdmin, asyncAdmin(async (req, res) => {
  const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => ['fullName', 'phone', 'profilePicture'].includes(key)));
  Object.assign(req.admin, changes);
  await req.admin.save();
  res.json(req.admin);
}));


router.patch('/admin-users/:id', authenticateAdmin, permitted('manageAdmins'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid admin ID' });
  const target = await Admin.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Admin not found' });
  if (target.role === 'super_admin') return res.status(403).json({ message: 'Super administrators cannot be edited here' });
  const allowed = ['username', 'email', 'fullName', 'status'];
  for (const k of allowed) {
    if (req.body && req.body[k] !== undefined) target[k] = req.body[k];
  }
  // Role elevation requires a separate administrator governance workflow.
  await target.save();
  res.json({ message: 'Admin updated', admin: target });
}));

router.delete('/admin-users/:id', authenticateAdmin, permitted('manageAdmins'), asyncAdmin(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid admin ID' });
  const target = await Admin.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Admin not found' });
  if (target.role === 'super_admin' || String(target._id) === String(req.admin._id)) {
    return res.status(403).json({ message: 'Cannot delete a super administrator or your own account' });
  }
  target.status = 'suspended';
  await target.save();
  res.json({ message: 'Admin access revoked (soft delete)' });
}));

module.exports = router;
