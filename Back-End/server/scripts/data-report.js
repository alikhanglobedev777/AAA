/** Read-only business data audit for the database named in MONGO_URI. */
require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');
const User = require('../models/user');
const ServiceCategory = require('../models/ServiceCategory');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
  const dbName = decodeURIComponent(new URL(process.env.MONGO_URI).pathname.slice(1));
  if (!dbName) throw new Error('URI must specify database explicitly');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const [businessStatus, users, demoBusinesses, categories, reviews, complaints] = await Promise.all([
      Business.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      User.countDocuments(), Business.countDocuments({ tags: 'AAA_DEMO_SEED_V2' }),
      ServiceCategory.countDocuments({ isActive: true }), Review.countDocuments(), Complaint.countDocuments(),
    ]);
    console.log(JSON.stringify({ database: dbName, businessStatus, demoBusinesses,
      users, categories, reviews, complaints }, null, 2));
    console.log('Read-only report. No records changed.');
  } finally { await mongoose.disconnect(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
