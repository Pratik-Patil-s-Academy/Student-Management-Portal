import api from '../config/api';

export const getAllAdmissions = async (status) => {
    try {
        const response = await api.get('/api/admissions/pending'); // Functionally pending queue
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAdmissionById = async (id) => {
    try {
        const response = await api.get(`/api/admissions/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const decideAdmission = async (id, action) => {
    try {
        const response = await api.put(`/api/admissions/${id}/decision`, { action }); // action: 'approve' | 'reject'
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
