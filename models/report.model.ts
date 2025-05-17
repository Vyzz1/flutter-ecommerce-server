import { model, models, Schema } from "mongoose";

const monthlyReportSchema = new Schema(
  {
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Reports = models?.MonthlyReport || model("Report", monthlyReportSchema);
export default Reports;
