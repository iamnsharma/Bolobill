/**
 * Seeds the static super admin user (phone + PIN).
 * Run: npx tsx scripts/seed-admin.ts
 *
 * Super admin: phone 6283515870, PIN 870870
 * After seeding, log in to the admin app with this phone + PIN to get full
 * super admin UI: Manage users, Manage subscriptions, Store links, Manage features.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.join(process.cwd(), '.env')});

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {UserModel} from '../src/models/User.model';

const ADMIN_PHONE = '6283515870';
const ADMIN_PIN = '870870';
const ADMIN_NAME = 'BoloBill Admin';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const pinHash = await bcrypt.hash(ADMIN_PIN, 10);

  const result = await UserModel.findOneAndUpdate(
    {phone: ADMIN_PHONE},
    {
      $set: {
        name: ADMIN_NAME,
        phone: ADMIN_PHONE,
        pinHash,
        role: 'superadmin',
        businessName: '',
        accountType: 'personal',
      },
    },
    {upsert: true, new: true},
  );

  console.log('Superadmin user seeded:', result.phone, result.role);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
