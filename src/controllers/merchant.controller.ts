import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';
import { CreateMerchantDto, UpdateMerchantDto } from '../dto/merchant.dto';

export class MerchantController {
  private merchantService: MerchantService;

  constructor() {
    this.merchantService = new MerchantService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantData = CreateMerchantDto.parse(req.body);
      const { merchant, token } = await this.merchantService.register(merchantData);
      
      res.status(201).json({
        status: 'success',
        data: {
          merchant,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = CreateMerchantDto.pick({ email: true, password: true }).parse(req.body);
      const { merchant, token } = await this.merchantService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchant = await this.merchantService.getProfile(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateData = UpdateMerchantDto.parse(req.body);
      const merchant = await this.merchantService.updateProfile(req.user._id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getMerchantsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const merchants = await this.merchantService.getMerchantsByCategory(category);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchants
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 