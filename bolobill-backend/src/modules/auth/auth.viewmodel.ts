import {UserDocument} from '../../models/User.model';

export const toAuthUserVm = (user: UserDocument) => ({
  id: user._id.toString(),
  name: user.name,
  businessName: user.businessName,
  phone: user.phone,
  accountType: user.accountType,
  ...(user.role && {role: user.role}),
  financeReportsHidden: Boolean(user.financeReportsHidden),
  hasInventoryPin: Boolean(user.inventoryPinHash),
});
