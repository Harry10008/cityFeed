import { IMerchant } from '../interfaces/merchant.interface';
import { Merchant } from '../models/merchant.model';
import { CreateMerchantDtoType, UpdateMerchantDtoType } from '../dto/merchant.dto';
import { Types } from 'mongoose';

export class MerchantRepository {
  async create(data: CreateMerchantDtoType): Promise<IMerchant> {
    const merchant = new Merchant(data);
    const savedMerchant = await merchant.save();
    return savedMerchant as unknown as IMerchant;
  }

  async findById(id: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) return null;
    return merchant as unknown as IMerchant;
  }

  async findByEmail(email: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findOne({ email }).select('+password +isVerified +role');
    if (!merchant) return null;
    return merchant as unknown as IMerchant;
  }

  async update(id: string, data: UpdateMerchantDtoType): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) return null;

    // Update fields
    Object.assign(merchant, data);
    const updatedMerchant = await merchant.save();
    return updatedMerchant as unknown as IMerchant;
  }

  async delete(id: string): Promise<boolean> {
    const result = await Merchant.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(): Promise<IMerchant[]> {
    const merchants = await Merchant.find();
    return merchants as unknown as IMerchant[];
  }

  async findByBusinessType(businessType: string): Promise<IMerchant[]> {
    const merchants = await Merchant.find({ businessType });
    return merchants as unknown as IMerchant[];
  }

  async findByFoodPreference(preference: 'veg' | 'nonveg' | 'both'): Promise<IMerchant[]> {
    const merchants = await Merchant.find({ foodPreference: preference });
    return merchants as unknown as IMerchant[];
  }

  async findByCategoryAndFoodPreference(
    category: string,
    preference: 'veg' | 'nonveg' | 'both'
  ): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      businessType: category,
      foodPreference: preference
    });
    return merchants as unknown as IMerchant[];
  }

  async updateVerificationStatus(id: string, isVerified: boolean): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) return null;

    merchant.isVerified = isVerified;
    const updatedMerchant = await merchant.save();
    return updatedMerchant as unknown as IMerchant;
  }

  async updateResetToken(
    id: string,
    resetToken: string,
    resetTokenExpires: Date
  ): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) return null;

    const merchantDoc = merchant as unknown as IMerchant;
    merchantDoc.resetToken = resetToken;
    merchantDoc.resetTokenExpires = resetTokenExpires;
    const updatedMerchant = await merchantDoc.save();
    return updatedMerchant as unknown as IMerchant;
  }

  async clearResetToken(id: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) return null;

    const merchantDoc = merchant as unknown as IMerchant;
    merchantDoc.resetToken = undefined;
    merchantDoc.resetTokenExpires = undefined;
    const updatedMerchant = await merchantDoc.save();
    return updatedMerchant as unknown as IMerchant;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) return null;

    merchant.password = hashedPassword;
    const updatedMerchant = await merchant.save();
    return updatedMerchant as unknown as IMerchant;
  }

  async addOffer(merchantId: string, offerId: Types.ObjectId): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) return null;

    if (!merchant.offers) {
      merchant.offers = [];
    }
    merchant.offers.push(offerId);
    const updatedMerchant = await merchant.save();
    return updatedMerchant as unknown as IMerchant;
  }

  async removeOffer(merchantId: string, offerId: Types.ObjectId): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) return null;

    if (merchant.offers) {
      merchant.offers = merchant.offers.filter(id => !id.equals(offerId));
    }
    const updatedMerchant = await merchant.save();
    return updatedMerchant as unknown as IMerchant;
  }
} 