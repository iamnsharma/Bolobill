import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../src/models/User.model';

const ADMIN_PHONE = '6283515870';
const ADMIN_PIN = '915870';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const user = await UserModel.findOne({ phone: ADMIN_PHONE });
  if (!user) {
    console.log('User not found for phone', ADMIN_PHONE);
    process.exit(1);
  }
  const ok = await bcrypt.compare(ADMIN_PIN, user.pinHash);
  console.log({ phone: user.phone, role: user.role, pinValid: ok });
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
