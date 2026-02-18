import { Admission } from "../models/admissionModel.js";
import { Batch } from "../models/batchModel.js";
import Test from "../models/testModel.js";
import { Inquiry } from "../models/inquiryModel.js";
import { Student } from "../models/studentModel.js";
import { FeeReceipt } from "../models/FeeReceiptModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();

        // Build last-6-months date buckets
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                label: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
                start: new Date(d.getFullYear(), d.getMonth(), 1),
                end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
            });
        }

        const [
            totalAdmissions,
            pendingAdmissions,
            totalBatches,
            totalStudents,
            scheduledTests,
            totalInquiries,
            allStudents,
            allReceipts,
            allAdmissions,
        ] = await Promise.all([
            Admission.countDocuments(),
            Admission.countDocuments({ status: "Pending" }),
            Batch.countDocuments(),
            Student.countDocuments({ batch: { $exists: true, $ne: null } }),
            Test.countDocuments({ testDate: { $gte: now } }),
            Inquiry.countDocuments(),
            Student.find({}, "standard").lean(),
            FeeReceipt.find({}, "feeStatus totalAmount remainingAmount").lean(),
            Admission.find({}, "createdAt").lean(),
        ]);

        // Standard distribution
        const standardDist = { "11": 0, "12": 0, Others: 0 };
        for (const s of allStudents) {
            const std = s.standard?.toString();
            if (std === "11") standardDist["11"]++;
            else if (std === "12") standardDist["12"]++;
            else standardDist["Others"]++;
        }
        const standardDistribution = Object.entries(standardDist).map(
            ([name, value]) => ({ name: `Std ${name}`, value })
        );

        // Fee status breakdown
        const feeStatusCount = { Paid: 0, "Partially Paid": 0, Pending: 0 };
        let totalCollected = 0;
        let totalOutstanding = 0;
        for (const r of allReceipts) {
            const status = r.feeStatus || "Pending";
            if (feeStatusCount[status] !== undefined) feeStatusCount[status]++;
            else feeStatusCount["Pending"]++;
            totalCollected += r.totalAmount || 0;
            totalOutstanding += r.remainingAmount || 0;
        }
        const feeBreakdown = Object.entries(feeStatusCount).map(
            ([name, value]) => ({ name, value })
        );

        // Monthly admissions trend (last 6 months)
        const admissionTrend = months.map(({ label, start, end }) => ({
            month: label,
            count: allAdmissions.filter((a) => {
                const d = new Date(a.createdAt);
                return d >= start && d <= end;
            }).length,
        }));

        res.status(200).json({
            success: true,
            stats: {
                totalAdmissions,
                pendingAdmissions,
                totalBatches,
                totalStudents,
                scheduledTests,
                totalInquiries,
                totalCollected,
                totalOutstanding,
            },
            charts: {
                standardDistribution,
                feeBreakdown,
                admissionTrend,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard stats",
            error: error.message,
        });
    }
};
