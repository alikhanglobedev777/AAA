'use strict';

/**
 * Safe, additive demo-data seed for local/development databases only.
 * No data is deleted or replaced. Database writes require --write and --db.
 * Atlas additionally requires --allow-remote. Production environments are blocked.
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { CATEGORIES, SEED_MARKER, makeUser, makeBusiness, makeCategory, emailFor } = require('./seed-data');

dotenv.config();

const User = require('../models/user');
const Business = require('../models/Business');
const ServiceCategory = require('../models/ServiceCategory');
const DEFAULTS = { shops: 240, providers: 600, consumers: 1500 };
const BATCH_SIZE = 200;

function optionsFrom(argv) {
  const opts = { ...DEFAULTS, write: false, allowRemote: false, confirmTestDb: false, db: '' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--write') opts.write = true;
    else if (arg === '--allow-remote') opts.allowRemote = true;
    else if (arg === '--confirm-test-db') opts.confirmTestDb = true;
    else if (arg === '--db' && argv[i + 1]) opts.db = argv[++i];
    else if (/^--(shops|providers|consumers)$/.test(arg) && argv[i + 1]) {
      opts[arg.slice(2)] = Number(argv[++i]);
    } else {
      throw new Error(`Unknown or incomplete option: ${arg}`);
    }
  }
  for (const key of ['shops', 'providers', 'consumers']) {
    if (!Number.isSafeInteger(opts[key]) || opts[key] < 0 || opts[key] > 5000) {
      throw new Error(`--${key} must be an integer from 0 to 5000`);
    }
  }
  return opts;
}

function connectionTarget(uri) {
  let url;
  try { url = new URL(uri); } catch (_) { throw new Error('MONGO_URI is not a valid MongoDB connection URL.'); }
  if (!['mongodb:', 'mongodb+srv:'].includes(url.protocol)) {
    throw new Error('MONGO_URI must use mongodb:// or mongodb+srv://.');
  }
  const db = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!db || !/^[a-zA-Z0-9_-]+$/.test(db)) {
    throw new Error('MONGO_URI must explicitly name a database in its path (e.g. /aaa_services_demo). The implicit "test" database is unsafe.');
  }
  const host = url.hostname.toLowerCase();
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(host);
  return { db, local };
}

function validateTarget(opts) {
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    throw new Error('Demo seeding is blocked in production and on Render. Seed a local/staging database before deployment.');
  }
  if (!opts.write) return null;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from Back-End/server/.env');
  if (!opts.db || !/^[a-zA-Z0-9_-]+$/.test(opts.db)) {
    throw new Error('Pass --db <database-name> to confirm the target database explicitly.');
  }
  const target = connectionTarget(process.env.MONGO_URI);
  if (['admin', 'local', 'config'].includes(opts.db.toLowerCase())) {
    throw new Error('Refusing to seed a reserved MongoDB database.');
  }
  if (opts.db.toLowerCase() === 'test' && !opts.confirmTestDb) {
    throw new Error('Database "test" requires --confirm-test-db. Verify in Atlas that this is your application database and back it up first.');
  }
  if (target.db !== opts.db) {
    throw new Error(`Database mismatch: URI points to "${target.db}" but --db confirms "${opts.db}". No data written.`);
  }
  if (!target.local && !opts.allowRemote) {
    throw new Error('Remote MongoDB detected. Explicitly pass --allow-remote after checking the Atlas cluster and database.');
  }
  if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 16) {
    throw new Error('Set SEED_PASSWORD to a strong, private value of at least 16 characters for all synthetic login accounts.');
  }
  return target;
}

async function bulkInsertOnly(Model, docs, filterOf) {
  let added = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const result = await Model.bulkWrite(batch.map((data) => ({
      updateOne: {
        filter: filterOf(data),
        update: { $setOnInsert: data },
        upsert: true,
      },
    })), { ordered: true });
    added += result.upsertedCount || 0;
    if (i === 0 || i + BATCH_SIZE >= docs.length) {
      console.log(`${Model.modelName}: processed ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`);
    }
  }
  return added;
}

async function seedUsers(shops, providers, consumers, passwordHash) {
  const users = [
    ...Array.from({ length: shops }, (_, i) => makeUser('shop', i)),
    ...Array.from({ length: providers }, (_, i) => makeUser('provider', i)),
    ...Array.from({ length: consumers }, (_, i) => makeUser('customer', i)),
  ].map((user) => ({ ...user, password: passwordHash }));

  // Abort on existing non-demo emails/usernames instead of taking over an account.
  const conflicts = await User.find({ $or: [
    { email: { $in: users.map((u) => u.email) } },
    { username: { $in: users.map((u) => u.username) } },
  ] }).select('email username userType tags').lean();
  for (const row of conflicts) {
    const expected = users.find((u) => u.email === row.email);
    if (!expected || !row.tags?.includes(SEED_MARKER) ||
      row.username !== expected.username || row.userType !== expected.userType) {
      throw new Error(`Existing account collision: ${row.email}. Aborting without changing that account.`);
    }
  }
  const added = await bulkInsertOnly(User, users, (u) => ({ email: u.email, tags: SEED_MARKER }));
  console.log(`Users: ${added} inserted, ${users.length - added} already seeded`);
  return new Map((await User.find({ email: { $in: users.map((u) => u.email) }, tags: SEED_MARKER })
    .select('_id email').lean()).map((u) => [u.email, u._id]));
}

async function seedBusinesses(shops, providers, usersByEmail) {
  const rows = [];
  for (const [kind, count] of [['shop', shops], ['provider', providers]]) {
    for (let index = 0; index < count; index++) {
      const owner = usersByEmail.get(emailFor(kind, index));
      if (!owner) throw new Error(`Missing seeded owner for ${kind} ${index + 1}`);
      rows.push(makeBusiness(kind, index, owner));
    }
  }

  // A demo owner should never be reassigned over a real listing.
  const existing = await Business.find({ owner: { $in: rows.map((b) => b.owner) } })
    .select('owner businessName tags').lean();
  for (const row of existing) {
    if (!row.tags?.includes(SEED_MARKER) ||
      !rows.some((b) => String(b.owner) === String(row.owner) && b.businessName === row.businessName)) {
      throw new Error(`Unexpected listing attached to demo owner ${row.owner}; no business records were changed.`);
    }
  }
  const added = await bulkInsertOnly(Business, rows, (b) => ({ owner: b.owner, businessName: b.businessName, tags: SEED_MARKER }));
  console.log(`Businesses: ${added} inserted, ${rows.length - added} already seeded`);
}

async function seedCategories() {
  let added = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    const data = makeCategory(CATEGORIES[i], i);
    const found = await ServiceCategory.findOne({ $or: [{ slug: data.slug }, { name: data.name }] }).select('_id').lean();
    if (!found) {
      try {
        await ServiceCategory.create(data);
        added++;
      } catch (err) {
        // Fail rather than modify somebody else's existing category.
        throw new Error(`Could not create category ${data.slug}: ${err.message}`);
      }
    }
  }
  console.log(`Categories: ${added} inserted, ${CATEGORIES.length - added} already exist (left unchanged)`);
}

async function main() {
  const opts = optionsFrom(process.argv.slice(2));
  const total = opts.shops + opts.providers + opts.consumers;
  console.log(`Demo seed plan: ${CATEGORIES.length} categories, ${opts.shops} shops, ${opts.providers} other service providers, ${opts.consumers} consumers.`);
  console.log(`Expected: ${opts.shops + opts.providers} business listings, ${total} user accounts, and ${4 * (opts.shops + opts.providers)} priced service offers.`);
  if (!opts.write) {
    console.log('DRY RUN: nothing written. To seed: npm run seed -- --write --db YOUR_DATABASE [--allow-remote]');
    return;
  }
  validateTarget(opts);
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    if (mongoose.connection.name !== opts.db) throw new Error('Connected database differs from the confirmed target.');
    console.log(`Connected to database "${mongoose.connection.name}". Additive DEMO insert-only mode.`);
    const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD, 12);
    await seedCategories();
    const users = await seedUsers(opts.shops, opts.providers, opts.consumers, passwordHash);
    await seedBusinesses(opts.shops, opts.providers, users);
    console.log(`Seed complete. All simulated accounts use your private SEED_PASSWORD (not printed).`);
    console.log(`Sample consumer: ${emailFor('customer', 0)} | provider: ${emailFor('provider', 0)} | shop: ${emailFor('shop', 0)}`);
    console.log('NOTE: This is fictional test data, not verified real-world businesses or reviews.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => { console.error(`Seed failed: ${err.message}`); process.exitCode = 1; });
