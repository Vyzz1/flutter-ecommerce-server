import Order from "../models/order.model";
import Product from "../models/product.model";
import Reports from "../models/report.model";

class DashboardService {
  private getDefaultAnnualRange = (): { startDate: Date; endDate: Date } => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    return { startDate, endDate };
  };

  private isValidDate = (date: string): boolean => {
    return date !== null && !isNaN(new Date(date).getTime());
  };

  async getStats(fromDate: string, toDate: string) {
    try {
      let startDate, endDate;
      if (
        !this.isValidDate(fromDate as string) ||
        !this.isValidDate(toDate as string)
      ) {
        ({ startDate, endDate } = this.getDefaultAnnualRange());
      } else {
        startDate = new Date(fromDate as string);
        endDate = new Date(toDate as string);
      }

      const totalOrders = await Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        currentStatus: { $ne: "Cancelled" },
      });
      const reportStats = await Reports.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalProfit: { $sum: "$profit" },
            totalRevenue: { $sum: "$totalRevenue" },
            totalCost: { $sum: "$totalCost" },
          },
        },
      ]);

      const totalUsers = await Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      const totalProducts = await Product.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      const stats = {
        totalOrders: totalOrders || 0,
        totalRevenue: reportStats[0]?.totalRevenue || 0,
        totalCost: reportStats[0]?.totalCost || 0,
        totalProfit: reportStats[0]?.totalProfit || 0,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getChartComparison(fromDate: string, toDate: string, groupBy: string) {
    try {
      let startDate, endDate;
      if (
        !this.isValidDate(fromDate as string) ||
        !this.isValidDate(toDate as string)
      ) {
        ({ startDate, endDate } = this.getDefaultAnnualRange());
      } else {
        startDate = new Date(fromDate as string);
        endDate = new Date(toDate as string);
      }
      let dateFormat;
      let dateTrunc;
      switch (groupBy) {
        case "year":
          dateFormat = { $year: "$createdAt" };
          dateTrunc = { year: { $year: "$createdAt" } };
          break;
        case "quarter":
          dateFormat = {
            year: { $year: "$createdAt" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
          };
          dateTrunc = {
            year: { $year: "$createdAt" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
          };
          break;
        case "month":
          dateFormat = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
          dateTrunc = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
          break;
        case "week":
          dateFormat = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          };
          dateTrunc = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          };
          break;
        default:
          dateFormat = { $year: "$createdAt" };
          dateTrunc = { year: { $year: "$createdAt" } };
      }

      const orderChart = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            currentStatus: { $ne: "Cancelled" },
          },
        },
        {
          $lookup: {
            from: "orderdetails",
            localField: "details",
            foreignField: "_id",
            as: "orderDetails",
          },
        },

        {
          // Aggregate profit data from Report
          $unwind: {
            path: "$orderDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: dateTrunc,
            totalRevenue: { $sum: "$totalAmount" },
            totalProductsSold: { $sum: "$orderDetails.quantity" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.quarter": 1,
            "_id.month": 1,
            "_id.week": 1,
          },
        },
      ]);

      const profitChart = await Reports.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: dateTrunc,
            totalProfit: { $sum: "$profit" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.quarter": 1,
            "_id.month": 1,
            "_id.week": 1,
          },
        },
      ]);

      // Aggregate product categories sold
      const categoryChart = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            currentStatus: { $ne: "Cancelled" },
          },
        },
        {
          $lookup: {
            from: "orderdetails",
            localField: "details",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        {
          $unwind: "$orderDetails",
        },
        {
          $lookup: {
            from: "products",
            localField: "orderDetails.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $group: {
            _id: { time: dateTrunc, category: "$category.name" },
            totalSold: { $sum: "$orderDetails.quantity" },
          },
        },
        {
          $group: {
            _id: "$_id.time",
            categories: {
              $push: {
                name: "$_id.category",
                totalSold: "$totalSold",
              },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.quarter": 1,
            "_id.month": 1,
            "_id.week": 1,
          },
        },
      ]);

      const chartData = orderChart.map((order) => ({
        time: order._id,
        revenue: order.totalRevenue,
        productsSold: order.totalProductsSold,
        profit:
          profitChart.find(
            (p) => JSON.stringify(p._id) === JSON.stringify(order._id)
          )?.totalProfit || 0,
        categories:
          categoryChart.find(
            (c) => JSON.stringify(c._id) === JSON.stringify(order._id)
          )?.categories || [],
      }));

      return chartData;
    } catch (error) {
      console.error("Error in getChartComparison:", error);
      throw error;
    }
  }
}

export default new DashboardService();
