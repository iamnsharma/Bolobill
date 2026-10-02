import mongoose, {InferSchemaType} from 'mongoose';

const stockProductSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'StockCategory', required: true, index: true},
    name: {type: String, required: true, trim: true},
    nameNormalized: {type: String, required: true, trim: true, lowercase: true},
    unit: {type: String, required: true, trim: true, default: 'pcs'},
    unitPrice: {type: Number, required: true, min: 0, default: 0},
    quantityOnHand: {type: Number, required: true, min: 0, default: 0},
    lowStockThreshold: {type: Number, min: 0, default: null},
  },
  {timestamps: true},
);

stockProductSchema.index({userId: 1, nameNormalized: 1}, {unique: true});

export type StockProductDocument = InferSchemaType<typeof stockProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StockProductModel = mongoose.model('StockProduct', stockProductSchema);
