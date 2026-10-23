/**
 * Import REAL businesses only when the owners already registered in AAA.
 * No synthetic owners, inferred email addresses, fake reviews, or verification claims.
 * Dry run by default. For Atlas: --write --db test --allow-remote --confirm-test-db --attest-owner-consent
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/user');
const Business = require('../models/Business');

const args = process.argv.slice(2);
const has = (s) => args.includes(s);
const arg = (s) => { const i = args.indexOf(s); return i >= 0 ? args[i + 1] : undefined; };
const write = has('--write');
const file = arg('--file');
const expectedDb = arg('--db');

async function main() {
  if (!file) throw new Error('Specify --file PATH_TO_JSON. See REAL_DATA_IMPORT.md.');
  const data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if (!Array.isArray(data) || !data.length) throw new Error('Input must be a nonempty JSON array.');
  if (data.length > 500) throw new Error('Import at most 500 records per run.');
  for (const [i, row] of data.entries()) {
    const fields = ['ownerEmail', 'businessName', 'businessType', 'description', 'contact', 'location'];
    if (fields.some(k => !row[k])) throw new Error(`Row ${i + 1}: missing a required field`);
    if (!row.contact.phone || !row.contact.email || !row.location.city || !row.location.address) {
      throw new Error(`Row ${i + 1}: missing contact phone/email or address/city`);
    }
    if (String(row.description).length < 20) throw new Error(`Row ${i + 1}: description too short`);
    if (row.verification?.isVerified) throw new Error(`Row ${i + 1}: imports cannot self-verify`);
    if (row.owner || row.status || row.tags?.includes('AAA_DEMO_SEED_V2')) {
      throw new Error(`Row ${i + 1}: owner/status/demo properties are not accepted`);
    }
  }
  if (!write) {
    console.log(`DRY RUN: ${data.length} owner-provided business records parsed. No database contact or writes.`);
    console.log('To import: npm run import:registered -- --file businesses.json --write --db test --allow-remote --confirm-test-db --attest-owner-consent');
    return;
  }
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) throw new Error('Run from an authorized development workstation, not Render.');
  if (!has('--attest-owner-consent')) throw new Error('Owner consent is mandatory: --attest-owner-consent');
  if (!expectedDb) throw new Error('Supply --db with the database name.');
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');
  const u = new URL(uri);
  const name = decodeURIComponent(u.pathname.slice(1));
  if (!name || name !== expectedDb) throw new Error('Database name mismatch or implicit default database.');
  if (/^mongodb\+srv:/.test(uri) && !has('--allow-remote')) throw new Error('Use --allow-remote to target Atlas.');
  if (name === 'test' && !has('--confirm-test-db')) throw new Error('Explicitly confirm --confirm-test-db');
  await mongoose.connect(uri);
  try {
    // Preflight every row before the first insert, so invalid owners/duplicates do not
    // cause partially imported batches. Concurrent writers should still be serialized.
    const pending = [];
    const seenOwners = new Set();
    let skipped = 0;
    for (const row of data) {
      const email = String(row.ownerEmail).toLowerCase().trim();
      const owner = await User.findOne({ email, userType: 'business', isActive: true, emailVerified: true });
      if (!owner || owner.tags?.includes('AAA_DEMO_SEED_V2')) {
        throw new Error(`No consenting, email-verified real business account found for ${email}. No records imported.`);
      }
      if (seenOwners.has(String(owner._id))) {
        throw new Error(`Duplicate owner ${email} in import file. No records imported.`);
      }
      seenOwners.add(String(owner._id));
      const existing = await Business.findOne({ owner: owner._id });
      if (existing) {
        if (existing.businessName.toLowerCase() !== row.businessName.toLowerCase()) {
          throw new Error(`Owner ${email} already owns another business. No records imported.`);
        }
        skipped++; continue;
      }
      const business = new Business({
        owner: owner._id, businessName: row.businessName, businessType: row.businessType,
        description: row.description, contact: row.contact, location: row.location,
        services: Array.isArray(row.services) ? row.services : [],
        status: 'active', verification: { isVerified: false, documents: [] },
        tags: ['Service Provider', 'Owner-submitted', 'Unverified'],
      });
      await business.validate();
      pending.push(business);
    }
    if (pending.length) {
      // This command targets Atlas (replica set) and uses a transaction to
      // avoid partial writes if any insert fails.
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          for (const business of pending) await business.save({ session });
        });
      } finally { await session.endSession(); }
    }
    const inserted = pending.length;
    console.log(`Imported ${inserted} new genuine owner-submitted listings; skipped ${skipped} already present.`);
    console.log('All new listings remain unverified until admin review.');
  } finally { await mongoose.disconnect(); }
}
main().catch((e) => { console.error('Import failed:', e.message); process.exitCode = 1; });
