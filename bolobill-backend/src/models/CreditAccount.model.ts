import mongoose, {InferSchemaType} from 'mongoose';

const creditAccountSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    phone: {type: String, required: true, trim: true},
    customerName: {type: String, required: true, trim: true},
    totalCredited: {type: Number, required: true, default: 0, min: 0},
    totalPaid: {type: Number, required: true, default: 0, min: 0},
    pendingBalance: {type: Number, required: true, default: 0, min: 0},
    lastActivityAt: {type: Date, default: () => new Date()},
  },
  {timestamps: true},
);

creditAccountSchema.index({userId: 1, phone: 1}, {unique: true});

export type CreditAccountDocument = InferSchemaType<typeof creditAccountSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CreditAccountModel = mongoose.model('CreditAccount', creditAccountSchema);
