import { Inquiry } from '../models/inquiry.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as inquiryService from '../services/inquiry.service.js';

export const createInquiry = asyncHandler(async (req, res) => {
  inquiryService.validateInquiryData(req.body);

  const inquiry = await inquiryService.createInquiryRecord(req.body);

  res.status(201).json({
    success: true,
    message: 'Inquiry created successfully',
    inquiry
  });
});

export const getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.fetchAllInquiries(req.query.status);

  res.status(200).json({
    success: true,
    count: inquiries.length,
    inquiries
  });
});

export const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.fetchInquiryById(req.params.id);

  res.status(200).json({
    success: true,
    inquiry
  });
});

export const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryRecord(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Inquiry updated successfully',
    inquiry
  });
});

export const deleteInquiry = asyncHandler(async (req, res) => {
  await inquiryService.deleteInquiryRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully'
  });
});

export const updateInquiryStatus = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryStatusRecord(req.params.id, req.body.status);

  res.status(200).json({
    success: true,
    message: 'Inquiry status updated successfully',
    inquiry
  });
});

export const getInquiriesByStatus = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.fetchInquiriesByStatus(req.params.status);

  res.status(200).json({
    success: true,
    count: inquiries.length,
    inquiries
  });
});

export const getInquiryStats = asyncHandler(async (req, res) => {
  const formattedStats = await inquiryService.calculateInquiryStats();

  res.status(200).json({
    success: true,
    stats: formattedStats
  });
});
