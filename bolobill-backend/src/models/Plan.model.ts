import mongoose, {InferSchemaType} from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true, unique: true}, // e.g. "Free Trial", "Premium"
    price: {type: Number, required: true, default: 0},
    invoiceLimit: {type: Number, required: true, default: 0}, // e.g. 50
    voiceMinutesLimit: {type: Number, required: true, default: 0}, // e.g. 15
    features: {type: [String], default: []}, // ["Export PDF", "Low Stock Alerts"]
    icon: {type: String, default: 'ti-star'}, // UI icon reference
    isActive: {type: Boolean, default: true}, // Allow disabling old plans
  },
  {timestamps: true},
);

export type PlanDocument = InferSchemaType<typeof planSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PlanModel = mongoose.model('Plan', planSchema);
