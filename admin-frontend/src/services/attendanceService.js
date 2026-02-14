import api from '../config/api';

// Mark attendance for a batch on a specific date
export const markAttendance = async (data) => {
    try {
        const response = await api.post('/api/attendance/mark', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get attendance records by batch with optional date filters
export const getAttendanceByBatch = async (batchId, startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get(`/api/attendance/batch/${batchId}`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get attendance records by student with optional date filters
export const getAttendanceByStudent = async (studentId, startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get(`/api/attendance/student/${studentId}`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all attendance records for a specific date
export const getAttendanceByDate = async (date) => {
    try {
        const response = await api.get(`/api/attendance/date/${date}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get attendance record by ID
export const getAttendanceById = async (id) => {
    try {
        const response = await api.get(`/api/attendance/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get attendance statistics for a student
export const getStudentAttendanceStats = async (studentId, startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get(`/api/attendance/student/${studentId}/stats`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update an existing attendance record
export const updateAttendance = async (id, data) => {
    try {
        const response = await api.put(`/api/attendance/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete an attendance record
export const deleteAttendance = async (id) => {
    try {
        const response = await api.delete(`/api/attendance/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
