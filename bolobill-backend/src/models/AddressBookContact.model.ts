import mongoose, {InferSchemaType} from 'mongoose';

const addressBookContactSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    phone: {type: String, required: true, trim: true},
    name: {type: String, required: true, trim: true},
  },
  {timestamps: true},
);

addressBookContactSchema.index({userId: 1, phone: 1}, {unique: true});

export type AddressBookContactDocument = InferSchemaType<typeof addressBookContactSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AddressBookContactModel = mongoose.model(
  'AddressBookContact',
  addressBookContactSchema,
);
