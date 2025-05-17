import Reports from "../models/report.model";

class ReporstService {
  async updateReport(order: any) {
    const date = new Date(order.createdAt);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    let revenue = 0;
    let cost = 0;

    for (const detail of order.details) {
      revenue += detail.price * detail.quantity;
      cost += (detail.basePrice || 0) * detail.quantity;
    }

    const profit = revenue - cost;

    const report = await Reports.findOneAndUpdate(
      {
        createdAt: { $gte: monthStart, $lt: nextMonthStart },
      },
      {
        $inc: {
          totalRevenue: revenue,
          totalCost: cost,
          profit: profit,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log(
      `✅ Report updated for ${date.toISOString().slice(0, 7)}: Revenue = ${
        report.totalRevenue
      }, Cost = ${report.totalCost}, Profit = ${report.profit}`
    );
  }
}

export default new ReporstService();
