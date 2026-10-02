import mongoose, {InferSchemaType} from 'mongoose';

const stockCategorySchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    name: {type: String, required: true, trim: true},
    sortOrder: {type: Number, default: 0},
  },
  {timestamps: true},
);

stockCategorySchema.index({userId: 1, name: 1}, {unique: true});

export type StockCategoryDocument = InferSchemaType<typeof stockCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StockCategoryModel = mongoose.model('StockCategory', stockCategorySchema);
