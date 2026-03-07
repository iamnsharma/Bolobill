import {UserDocument} from '../../models/User.model';

export const toAuthUserVm = (user: UserDocument) => ({
  id: user._id.toString(),
  name: user.name,
  phone: user.phone,
  accountType: user.accountType,
});
