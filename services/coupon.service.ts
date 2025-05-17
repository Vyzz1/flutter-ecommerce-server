import ArgumentError from "../errors/AgrumentError";
import Coupon from "../models/coupon.model";
import Order from "../models/order.model";

class CouponService {
  constructor() {}

  async createCoupon(copoun: CouponRequest) {
    try {
      const findExist = await Coupon.findOne({ code: copoun.code }).exec();

      if (findExist) {
        throw new ArgumentError("Coupon already exists", 409);
      }

      const newCoupon = await Coupon.create({
        code: copoun.code,
        discount: copoun.discount,
        count: copoun.count,
        limit: copoun.limit,
      });

      return newCoupon;
    } catch (error) {
      throw error;
    }
  }

  async editCoupon(id: string, coupon: CouponRequest) {
    try {
      const findExist = await Coupon.findById(id).exec();

      if (!findExist) {
        throw new ArgumentError("Coupon Not Found", 404);
      }

      const findDuplicate = await Coupon.findOne({
        code: coupon.code,

        _id: { $ne: id },
      }).exec();

      if (findDuplicate) {
        throw new ArgumentError("Coupon already exists", 409);
      }

      findExist.code = coupon.code;

      findExist.discount = coupon.discount;

      findExist.limit = coupon.limit;

      await findExist.save();

      return findExist;
    } catch (error) {
      throw error;
    }
  }

  async deleteCoupon(id: string) {
    try {
      const coupon = await Coupon.findByIdAndDelete(id).exec();

      if (!coupon) {
        throw new ArgumentError("Coupon Not Found", 404);
      }
    } catch (error) {
      throw error;
    }
  }

  async getCoupons() {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).exec();

      return coupons;
    } catch (error) {
      throw new Error("Error fetching coupons");
    }
  }

  async findCouponById(id: string) {
    try {
      const coupon = await Coupon.findById(id).exec();

      if (!coupon) {
        throw new ArgumentError("Coupon Not Found", 404);
      }

      return coupon;
    } catch (error) {
      throw new Error("Error fetching coupon");
    }
  }

  async findCouponByCategory(category: Array<string>) {
    try {
      if (category.length === 0) {
        return [];
      }
      const coupons = await Coupon.find({
        categories: { $in: [category] },
      })
        .sort({ createdAt: -1 })
        .exec();

      return coupons;
    } catch (error) {
      throw new Error("Error fetching coupons");
    }
  }

  async findAvailableCoupons() {
    try {
      const coupons = await Coupon.find({ limit: { $gt: 0 } }).exec();
      return coupons;
    } catch (error) {
      throw new Error("Error fetching available coupons");
    }
  }

  async findOrderByCode(code: string) {
    try {
      const order = await Order.find({ discountCode: code })
        .populate({
          path: "details",
          select: "-__v",
        })
        .populate({
          path: "statuses",
          select: "_id status createdAt",
        })
        .lean()
        .exec();

      return order || [];
    } catch (error) {
      throw error;
    }
  }
}

export default new CouponService();
