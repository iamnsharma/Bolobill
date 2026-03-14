/**
 * Seeds a business-type user for testing admin (business) login.
 * Run: npx tsx scripts/seed-business-user.ts
 * User: phone 9988776655, pin 123456 — use these to sign in on admin panel.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.join(process.cwd(), '.env')});

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {UserModel} from '../src/models/User.model';

const BUSINESS_PHONE = '9988776655';
const BUSINESS_PIN = '123456';
const BUSINESS_NAME = 'Test Business User';
const BUSINESS_NAME_SHOP = 'My Test Shop';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const pinHash = await bcrypt.hash(BUSINESS_PIN, 10);

  const result = await UserModel.findOneAndUpdate(
    {phone: BUSINESS_PHONE},
    {
      $set: {
        name: BUSINESS_NAME,
        phone: BUSINESS_PHONE,
        pinHash,
        role: 'user',
        businessName: BUSINESS_NAME_SHOP,
        accountType: 'business',
      },
    },
    {upsert: true, returnDocument: 'after'},
  );

  console.log('Business user seeded:', result.phone, result.accountType, result.businessName);
  console.log('Login on admin with phone:', BUSINESS_PHONE, 'and PIN:', BUSINESS_PIN);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
