import api from '../config/api';

export const getAllTests = async (filters = {}) => {
    try {
        const params = {};
        if (filters.classLevel) params.classLevel = filters.classLevel;
        if (filters.subject) params.subject = filters.subject;
        if (filters.batchId) params.batchId = filters.batchId;
        const response = await api.get('/api/tests/all', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getTestById = async (testId) => {
    try {
        const response = await api.get(`/api/tests/${testId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createTest = async (data) => {
    try {
        const response = await api.post('/api/tests/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const addOrUpdateScores = async (testId, scores) => {
    try {
        const response = await api.put(`/api/tests/${testId}/scores`, { scores });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteTest = async (testId) => {
    try {
        const response = await api.delete(`/api/tests/${testId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getTestStatistics = async (testId) => {
    try {
        const response = await api.get(`/api/tests/${testId}/statistics`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getStudentTestHistory = async (studentId) => {
    try {
        const response = await api.get(`/api/tests/student/${studentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getOverallPerformance = async (params = {}) => {
    try {
        const response = await api.get('/api/tests/performance/overall', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
