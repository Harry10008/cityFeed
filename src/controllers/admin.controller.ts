import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto, UpdateAdminDto } from '../dto/admin.dto';
import { AppError } from '../utils/appError';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminData = CreateAdminDto.parse(req.body);
      const { admin, token } = await this.adminService.register(adminData);
      
      res.status(201).json({
        status: 'success',
        data: {
          admin,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = CreateAdminDto.pick({ email: true, password: true }).parse(req.body);
      const { admin, token } = await this.adminService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await this.adminService.getProfile(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateData = UpdateAdminDto.parse(req.body);
      const admin = await this.adminService.updateProfile(req.user._id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updatePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        throw new AppError('Permissions must be an array', 400);
      }

      const admin = await this.adminService.updatePermissions(req.user._id, permissions);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAdmins = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await this.adminService.getAllAdmins();
      
      res.status(200).json({
        status: 'success',
        data: {
          admins
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 