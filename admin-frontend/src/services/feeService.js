import api from '../config/api';

// Get all students with their fee details
export const getAllStudentsWithFees = async () => {
    try {
        const response = await api.get('/api/students/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get student fee details by ID
export const getStudentFeeDetails = async (studentId) => {
    try {
        const response = await api.get(`/api/fees/student/${studentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Process a fee payment
export const makeFeePayment = async (paymentData) => {
    try {
        const response = await api.post('/api/fees/make-payment', paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get student receipt
export const getStudentReceipt = async (studentId) => {
    try {
        const response = await api.get(`/api/fees/receipt/student/${studentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get receipt by ID
export const getReceiptById = async (receiptId) => {
    try {
        const response = await api.get(`/api/fees/receipt/${receiptId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Send installment email
export const sendInstallmentEmail = async (installmentId) => {
    try {
        const response = await api.post(`/api/fees/email/installment/${installmentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Send all installment emails for a student
export const sendAllInstallmentEmails = async (studentId) => {
    try {
        const response = await api.post(`/api/fees/email/student/${studentId}/all`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};