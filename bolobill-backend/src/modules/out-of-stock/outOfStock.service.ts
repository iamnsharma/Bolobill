import {ApiError} from '../../common/ApiError';
import {OutOfStockModel} from '../../models/OutOfStock.model';

export const outOfStockService = {
  async list(userId: string) {
    return OutOfStockModel.find({userId}).sort({createdAt: -1}).lean();
  },

  async create(userId: string, payload: {name: string; quantity?: string; note?: string}) {
    return OutOfStockModel.create({
      userId,
      name: payload.name.trim(),
      quantity: (payload.quantity ?? '').trim(),
      note: (payload.note ?? '').trim(),
    });
  },

  async getById(userId: string, id: string) {
    const doc = await OutOfStockModel.findOne({_id: id, userId});
    if (!doc) throw new ApiError(404, 'Out of stock item not found');
    return doc;
  },

  async update(
    userId: string,
    id: string,
    payload: {name?: string; quantity?: string; note?: string},
  ) {
    const doc = await OutOfStockModel.findOne({_id: id, userId});
    if (!doc) throw new ApiError(404, 'Out of stock item not found');
    if (payload.name !== undefined) doc.name = payload.name.trim();
    if (payload.quantity !== undefined) doc.quantity = payload.quantity.trim();
    if (payload.note !== undefined) doc.note = payload.note.trim();
    await doc.save();
    return doc;
  },

  async delete(userId: string, id: string) {
    const doc = await OutOfStockModel.findOneAndDelete({_id: id, userId});
    if (!doc) throw new ApiError(404, 'Out of stock item not found');
    return {message: 'Deleted'};
  },
};
