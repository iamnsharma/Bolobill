import mongoose, {InferSchemaType} from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    businessName: {type: String, trim: true, default: ''},
    phone: {type: String, required: true, unique: true, index: true},
    pinHash: {type: String, required: true},
    role: {type: String, enum: ['user', 'admin', 'superadmin'], default: 'user'},
    isBlacklisted: {type: Boolean, default: false},
    accountType: {type: String, enum: ['personal', 'business'], default: 'personal'},
    usage: {
      invoiceRequestSuccessCount: {type: Number, default: 0, min: 0},
      voiceToTextSecondsUsed: {type: Number, default: 0, min: 0},
    },
    subscription: {
      planId: {type: mongoose.Schema.Types.ObjectId, ref: 'Plan'},
      status: {type: String, enum: ['active', 'expired', 'cancelled', 'none'], default: 'none'},
      expiresAt: {type: Date},
    },
    qrCodePath: {type: String, default: '', trim: true},
  },
  {timestamps: true},
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = mongoose.model('User', userSchema);
