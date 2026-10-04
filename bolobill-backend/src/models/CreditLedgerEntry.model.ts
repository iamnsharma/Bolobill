import mongoose, {InferSchemaType} from 'mongoose';

const creditLedgerEntrySchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditAccount',
      required: true,
      index: true,
    },
    type: {type: String, enum: ['sale', 'payment'], required: true},
    amount: {type: Number, required: true, min: 0},
    invoiceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Invoice'},
    invoicePublicId: {type: String, trim: true, default: ''},
    note: {type: String, trim: true, default: ''},
  },
  {timestamps: true},
);

creditLedgerEntrySchema.index({accountId: 1, createdAt: -1});

export type CreditLedgerEntryDocument = InferSchemaType<typeof creditLedgerEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CreditLedgerEntryModel = mongoose.model(
  'CreditLedgerEntry',
  creditLedgerEntrySchema,
);
