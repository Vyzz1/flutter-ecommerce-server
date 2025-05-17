import Order from "../models/order.model";
import Reports from "../models/report.model";

async function updateReport() {
  const allOrders = await Order.find({ currentStatus: "Delivered" }).populate(
    "details"
  );

  console.log(`🔍 Found ${allOrders.length} completed orders`);

  const monthlyData = new Map(); // key = 'YYYY-MM', value = { revenue, cost }

  for (const order of allOrders) {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    let revenue = 0;
    let cost = 0;

    for (const detail of order.details) {
      if (
        typeof detail.price !== "number" ||
        typeof detail.basePrice !== "number"
      ) {
        console.warn(
          `⚠️ Skipping detail in order ${order._id} due to missing price or basePrice`
        );
        continue;
      }

      revenue += detail.price * detail.quantity;
      cost += detail.basePrice * detail.quantity;
    }

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { revenue: 0, cost: 0 });
    }

    const monthRecord = monthlyData.get(monthKey);
    monthRecord.revenue += revenue;
    monthRecord.cost += cost;
  }

  console.log("📊 Monthly profit summary:");
  for (const [monthKey, { revenue, cost }] of monthlyData.entries()) {
    const [year, month] = monthKey.split("-").map(Number);
    const createdAt = new Date(year, month - 1, 1);

    const profit = revenue - cost;

    if (profit < 0) {
      console.warn(`❌ Skipping ${monthKey} due to negative profit: ${profit}`);
      continue;
    }

    await Reports.findOneAndUpdate(
      { createdAt: { $gte: createdAt, $lt: new Date(year, month, 1) } },
      {
        $inc: {
          totalRevenue: revenue,
          totalCost: cost,
          profit: profit,
        },
      },
      { upsert: true, new: true }
    );

    console.log(
      `✅ ${monthKey}: Revenue = ${revenue}, Cost = ${cost}, Profit = ${profit}`
    );
  }

  console.log("🎉 Done updating Monthly Reports");
}

export default updateReport;
