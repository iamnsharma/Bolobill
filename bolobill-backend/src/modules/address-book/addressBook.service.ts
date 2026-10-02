import {ApiError} from '../../common/ApiError';
import {normalizePhone} from '../../common/phone';
import {AddressBookContactModel} from '../../models/AddressBookContact.model';

export function phoneForAddressBook(raw: string): string {
  const normalized = normalizePhone(raw);
  if (normalized.length < 10) {
    throw new ApiError(400, 'Enter a valid 10-digit phone number');
  }
  return normalized.length > 10 ? normalized.slice(-10) : normalized;
}

export const addressBookService = {
  async lookup(userId: string, rawPhone: string) {
    const phone = phoneForAddressBook(rawPhone);
    const contact = await AddressBookContactModel.findOne({userId, phone}).lean();
    if (!contact) return {found: false as const};
    return {
      found: true as const,
      contact: {
        id: contact._id.toString(),
        phone: contact.phone,
        name: contact.name,
      },
    };
  },

  async upsert(userId: string, rawPhone: string, name: string) {
    const phone = phoneForAddressBook(rawPhone);
    const trimmedName = name.trim();
    const contact = await AddressBookContactModel.findOneAndUpdate(
      {userId, phone},
      {$set: {name: trimmedName}},
      {new: true, upsert: true, runValidators: true},
    );
    return {
      id: contact._id.toString(),
      phone: contact.phone,
      name: contact.name,
    };
  },

  async list(userId: string, opts: {q?: string; page: number; limit: number}) {
    const filter: Record<string, unknown> = {userId};
    const q = opts.q?.trim();
    if (q) {
      const digits = q.replace(/\D/g, '');
      if (digits.length >= 3) {
        filter.$or = [
          {phone: {$regex: digits}},
          {name: {$regex: q, $options: 'i'}},
        ];
      } else {
        filter.name = {$regex: q, $options: 'i'};
      }
    }
    const skip = (opts.page - 1) * opts.limit;
    const [items, total] = await Promise.all([
      AddressBookContactModel.find(filter)
        .sort({updatedAt: -1})
        .skip(skip)
        .limit(opts.limit)
        .lean(),
      AddressBookContactModel.countDocuments(filter),
    ]);
    return {
      contacts: items.map(c => ({
        id: c._id.toString(),
        phone: c.phone,
        name: c.name,
        updatedAt: c.updatedAt,
      })),
      total,
      page: opts.page,
      limit: opts.limit,
      totalPages: Math.max(1, Math.ceil(total / opts.limit)),
    };
  },

  async remove(userId: string, contactId: string) {
    const deleted = await AddressBookContactModel.findOneAndDelete({
      _id: contactId,
      userId,
    });
    if (!deleted) {
      throw new ApiError(404, 'Contact not found');
    }
    return {ok: true};
  },
};
