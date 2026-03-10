import mongoose, {InferSchemaType} from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {type: String, required: true, trim: true},
  },
  {timestamps: true},
);

export type FeedbackDocument = InferSchemaType<typeof feedbackSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FeedbackModel = mongoose.model('Feedback', feedbackSchema);
