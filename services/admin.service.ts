import ArgumentError from "../errors/AgrumentError";
import Brand from "../models/brand.model";
import Category from "../models/category.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import Reports from "../models/report.model";
import User from "../models/user.model";

class AdminService {
  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new ArgumentError("Product not found", 404);
    }

    return product;
  }
  async getAllUser() {
    try {
      const user = await User.find({
        role: { $ne: "admin" },
      })
        .select("-password -__v -role")
        .sort({ createdAt: -1 });

      return user;
    } catch (error) {
      throw error;
    }
  }
  async getDashboardData(timestamp?: Date) {
    try {
      if (!timestamp) {
        //set default timestamp to annualy

        const date = new Date();

        date.setFullYear(date.getFullYear() - 1);

        timestamp = date;
      }

      //total Revenue

      //total profit

      //total orders

      //total users

      //total products

      const totalUsers = await User.countDocuments({
        role: { $ne: "admin" },
        createdAt: { $gte: timestamp },
      }).exec();

      const totalProducts = await Product.countDocuments({
        createdAt: { $gte: timestamp },
      }).exec();

      const totalOrder = await Order.countDocuments({
        createdAt: { $gte: timestamp },
      });

      // const report = await Reports.find
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  async banUser(userId: string) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isBanned: true },
        { new: true }
      ).select("-password -__v -role -refreshToken");

      if (!user) {
        throw new ArgumentError("User not found", 404);
      }
      return user;
    } catch (error) {
      console.error("Error banning user:", error);
      throw error;
    }
  }

  async updateUser(userId: string, data: UpdateInformationRequest) {
    try {
      const user = await User.findByIdAndUpdate(userId, data, { new: true });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async unBanUser(userId: string) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isBanned: false },
        { new: true }
      );
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error unbanning user:", error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async getAllProducts(request: ProductFilterRequest) {
    try {
      const {
        page = 0,
        limit = 5,
        sortBy = "updatedAt",
        sortType = "desc",
        brands = [],
        minPrice,
        maxPrice,
        categories = [],
        rating,
        keyword,
      } = request;

      const query: any = {};

      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.minPrice = {};
        if (minPrice !== undefined) {
          query.minPrice.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
          query.minPrice.$lte = maxPrice;
        }
      }

      if (brands.length > 0) {
        query.brand = { $in: brands };
      }

      if (categories.length > 0) {
        query.category = { $in: categories };
      }

      if (rating) {
        switch (rating) {
          case "BELOW_3":
            query.avgRating = { $lt: 3 };
            break;
          case "3_TO_4":
            query.avgRating = { $gte: 3, $lt: 4 };
            break;
          case "4_TO_5":
            query.avgRating = { $gte: 4, $lte: 5 };
            break;
        }
      }

      const skip = page * limit;

      const sort: any = {};

      if (!sortBy) {
        sort["updatedAt"] = -1;
      }

      sort[sortBy] = sortType === "asc" ? 1 : -1;

      const total = await Product.countDocuments(query);

      console.log(sort);

      const products = await Product.find(query)
        .populate("category", "name image")
        .populate("brand", "name _id")
        .populate("attributes", "name _id")
        .populate({
          path: "variants",
          select: "price stock attributes basePrice images discount _id",
          populate: {
            path: "attributes.attribute",
            select: "name",
          },
        })
        .select("-__v")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      const totalPages = Math.ceil(total / limit);
      const isNext = page < totalPages;
      const isLast = page === totalPages;
      const isFirst = page === 0;

      return {
        data: products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          isNext,
          isLast,
          isFirst,
        },
      };
    } catch (error) {
      console.error("Failed to get products:", error);
      throw error;
    }
  }
}

export default new AdminService();
