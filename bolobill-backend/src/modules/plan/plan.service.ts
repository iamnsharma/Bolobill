import {ApiError} from '../../common/ApiError';
import {PlanModel} from '../../models/Plan.model';

export const planService = {
  list: async () => {
    return PlanModel.find({isActive: true}).sort({price: 1});
  },

  listAllAdmin: async () => {
    return PlanModel.find().sort({price: 1});
  },

  create: async (data: any) => {
    return PlanModel.create(data);
  },

  update: async (id: string, data: any) => {
    const plan = await PlanModel.findByIdAndUpdate(id, data, {new: true});
    if (!plan) throw new ApiError(404, 'Plan not found');
    return plan;
  },

  delete: async (id: string) => {
    // Optionally soft delete by marking isActive = false
    const plan = await PlanModel.findByIdAndUpdate(id, {isActive: false}, {new: true});
    if (!plan) throw new ApiError(404, 'Plan not found');
    return true;
  },
};
