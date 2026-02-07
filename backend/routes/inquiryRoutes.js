import express from 'express';
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  updateInquiry,
  deleteInquiry,
  getInquiriesByStatus,
  getInquiryStats
} from '../controllers/inquiryController.js';

const router = express.Router();

router.post('/create', createInquiry);
router.get('/', getAllInquiries);
router.get('/stats', getInquiryStats);
router.get('/status/:status', getInquiriesByStatus);
router.get('/:id', getInquiryById);
router.patch('/:id/status', updateInquiryStatus);
router.put('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
