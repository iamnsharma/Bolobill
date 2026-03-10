import mongoose, {InferSchemaType} from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    quantity: {type: String, required: true, trim: true},
    totalPrice: {type: Number, required: true, min: 0},
  },
  {_id: false},
);

const invoiceSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    invoiceId: {type: String, required: true, unique: true, index: true},
    customerName: {type: String, required: true, trim: true, default: 'Customer'},
    items: {type: [itemSchema], required: true},
    total: {type: Number, required: true, min: 0},
    voiceTranscript: {type: String, default: ''},
    pdfPath: {type: String, default: ''},
    source: {type: String, enum: ['voice', 'manual'], required: true},
  },
  {timestamps: true},
);

export type InvoiceDocument = InferSchemaType<typeof invoiceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InvoiceModel = mongoose.model('Invoice', invoiceSchema);
