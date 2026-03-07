import mongoose from 'mongoose';
import {env} from './env';

export const connectDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
};
