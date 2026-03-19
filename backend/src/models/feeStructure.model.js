import mongoose from 'mongoose';

/**
 * FeeStructure stores the fixed total fee for each standard.
 * One document per standard (upserted). Admin sets e.g. ₹15,000 for 11th.
 */
const feeStructureSchema = new mongoose.Schema({
    standard: {
        type: String,
        required: true,
        enum: ['11', '12', 'Others'],
        unique: true
    },
    totalFee: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ''
    },
    academicYear: {
        type: String,
        default: () => {
            const now = new Date();
            const year = now.getFullYear();
            return `${year}-${year + 1}`;
        }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
