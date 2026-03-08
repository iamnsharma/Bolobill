import mongoose, {InferSchemaType} from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    phone: {type: String, required: true, unique: true, index: true},
    pinHash: {type: String, required: true},
    accountType: {type: String, enum: ['personal', 'business'], default: 'personal'},
    usage: {
      invoiceRequestSuccessCount: {type: Number, default: 0, min: 0},
      voiceToTextSecondsUsed: {type: Number, default: 0, min: 0},
    },
  },
  {timestamps: true},
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = mongoose.model('User', userSchema);
