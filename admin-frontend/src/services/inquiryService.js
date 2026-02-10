import api from '../config/api';

const INQUIRY_API_URL = '/api/inquiries';

export const getAllInquiries = async (status) => {
    try {
        const params = status ? { status } : {};
        const response = await api.get(INQUIRY_API_URL, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInquiryById = async (id) => {
    try {
        const response = await api.get(`${INQUIRY_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInquiryStats = async () => {
    try {
        const response = await api.get(`${INQUIRY_API_URL}/stats`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateInquiryStatus = async (id, status) => {
    try {
        const response = await api.patch(`${INQUIRY_API_URL}/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteInquiry = async (id) => {
    try {
        const response = await api.delete(`${INQUIRY_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
