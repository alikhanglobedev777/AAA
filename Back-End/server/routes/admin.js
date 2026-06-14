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
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json({ admins });
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

module.exports = router;
