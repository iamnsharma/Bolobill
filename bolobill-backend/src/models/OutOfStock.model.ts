import mongoose, {InferSchemaType} from 'mongoose';

const outOfStockSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    name: {type: String, required: true, trim: true},
    quantity: {type: String, trim: true, default: ''},
    note: {type: String, trim: true, default: ''},
  },
  {timestamps: true},
);

export type OutOfStockDocument = InferSchemaType<typeof outOfStockSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OutOfStockModel = mongoose.model('OutOfStock', outOfStockSchema);
