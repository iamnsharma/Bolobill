import mongoose, {InferSchemaType} from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'StockProduct', required: true, index: true},
    type: {
      type: String,
      enum: ['purchase', 'sale', 'adjustment', 'reversal'],
      required: true,
    },
    delta: {type: Number, required: true},
    quantityAfter: {type: Number, required: true, min: 0},
    invoiceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Invoice'},
    note: {type: String, trim: true, default: ''},
  },
  {timestamps: true},
);

export type StockMovementDocument = InferSchemaType<typeof stockMovementSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StockMovementModel = mongoose.model('StockMovement', stockMovementSchema);
