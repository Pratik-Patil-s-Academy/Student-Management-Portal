import api from '../config/api';

export const getAllStudents = async () => {
    try {
        const response = await api.get('/api/students/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStudentById = async (id) => {
    try {
        const response = await api.get(`/api/students/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const config = {};
        if (studentData instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        const response = await api.put(`/api/students/${id}`, studentData, config);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteStudent = async (id) => {
    try {
        const response = await api.delete(`/api/students/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateStudentStatus = async (id, status) => {
    try {
        const response = await api.patch(`/api/students/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const assignBatch = async (id, batchId) => {
    try {
        const response = await api.put(`/api/students/${id}/assign-batch`, { batchId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export const removeBatch = async (id) => {
    try {
        const response = await api.put(`/api/students/${id}/remove-batch`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export const getStudentsWithNoBatch = async () => {
    try {
        const response = await api.get('/api/students/nobatch');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}
