import { Request, Response } from "express";
import { CouponModel } from "../models/Coupon";

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await CouponModel.findOne({
            code: req.body.code.toUpperCase(),
            used: false,
            validUntil: { $gt: new Date() }
        });

        if (!coupon) {
            res.status(400).json({ 
                success: false,
                message: 'Cupón no válido o expirado' 
            });
            return;
        }

        res.json({ 
            success: true,
            data: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                validUntil: coupon.validUntil
            }
        });

    } catch (error) {
        console.error('Error validando cupón:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error validando cupón'
        });
    }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
     /*   if (!req.user.isAdmin) {
            res.status(403).json({ 
                success: false, 
                message: 'No autorizado' 
            });
            return;
        }  */

        const coupon = new CouponModel({
            code: req.body.code.toUpperCase(),
            discountPercentage: req.body.discountPercentage,
            validUntil: new Date(req.body.validUntil)
        });

        await coupon.save();

        res.status(201).json({ 
            success: true,
            data: coupon 
        });

    } catch (error) {
        console.error('Error creando cupón:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creando cupón'
        });
    }
};

export const listCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      /*  if (!req.user.isAdmin) {
            res.status(403).json({ 
                success: false, 
                message: 'No autorizado' 
            });
            return;
        } */

        const coupons = await CouponModel.find()
            .sort({ createdAt: -1 })
            .exec();

        res.json({ 
            success: true,
            data: coupons 
        });

    } catch (error) {
        console.error('Error listando cupones:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error listando cupones'
        });
    }
};