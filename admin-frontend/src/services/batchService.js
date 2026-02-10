import api from '../config/api';

export const getAllBatches = async () => {
    try {
        const response = await api.get('/api/batches/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getBatchById = async (id) => {
    try {
        const response = await api.get(`/api/batches/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createBatch = async (batchData) => {
    try {
        const response = await api.post('/api/batches/create', batchData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateBatch = async (id, batchData) => {
    try {
        const response = await api.put(`/api/batches/${id}`, batchData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteBatch = async (id) => {
    try {
        const response = await api.delete(`/api/batches/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addStudentsToBatch = async (batchId, studentIds) => {
    try {
        const response = await api.post(`/api/batches/${batchId}/add-students`, { studentIds });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const removeStudentsFromBatch = async (batchId, studentIds) => {
    try {
        const response = await api.post(`/api/batches/${batchId}/remove-students`, { studentIds });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
