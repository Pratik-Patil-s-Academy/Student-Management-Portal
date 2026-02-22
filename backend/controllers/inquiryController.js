import { Inquiry } from '../models/inquiryModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as inquiryService from '../services/inquiryService.js';

export const createInquiry = TryCatch(async (req, res) => {
  inquiryService.validateInquiryData(req.body);

  const inquiry = await inquiryService.createInquiryRecord(req.body);

  res.status(201).json({
    success: true,
    message: 'Inquiry created successfully',
    inquiry
  });
});

export const getAllInquiries = TryCatch(async (req, res) => {
  const inquiries = await inquiryService.fetchAllInquiries(req.query.status);

  res.status(200).json({
    success: true,
    count: inquiries.length,
    inquiries
  });
});

export const getInquiryById = TryCatch(async (req, res) => {
  const inquiry = await inquiryService.fetchInquiryById(req.params.id);

  res.status(200).json({
    success: true,
    inquiry
  });
});

export const updateInquiry = TryCatch(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryRecord(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Inquiry updated successfully',
    inquiry
  });
});

export const deleteInquiry = TryCatch(async (req, res) => {
  await inquiryService.deleteInquiryRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully'
  });
});

export const updateInquiryStatus = TryCatch(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryStatusRecord(req.params.id, req.body.status);

  res.status(200).json({
    success: true,
    message: 'Inquiry status updated successfully',
    inquiry
  });
});

export const getInquiriesByStatus = TryCatch(async (req, res) => {
  const inquiries = await inquiryService.fetchInquiriesByStatus(req.params.status);

  res.status(200).json({
    success: true,
    count: inquiries.length,
    inquiries
  });
});

export const getInquiryStats = TryCatch(async (req, res) => {
  const formattedStats = await inquiryService.calculateInquiryStats();

  res.status(200).json({
    success: true,
    stats: formattedStats
  });
});
