
import { Admission } from "../models/admissionModel.js";
import { Batch } from "../models/batchModel.js";
import Test from "../models/testModel.js";
import { Inquiry } from "../models/inquiryModel.js";
import { Student } from "../models/studentModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalAdmissions,
            pendingAdmissions,
            totalBatches,
            totalStudents,
            scheduledTests,
            totalInquiries,
        ] = await Promise.all([
            Admission.countDocuments(),
            Admission.countDocuments({ status: "Pending" }),
            Batch.countDocuments(),
            Student.countDocuments({ batch: { $exists: true, $ne: null } }),
            Test.countDocuments({ testDate: { $gte: new Date() } }),
            Inquiry.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalAdmissions,
                pendingAdmissions,
                totalBatches,
                totalStudents,
                scheduledTests,
                totalInquiries,
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
