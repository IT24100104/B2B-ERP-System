import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5008/api',
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginCall = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const fetchCustomers = async () => {
    const response = await api.get('/customers');
    return response.data;
};

export const createCustomer = async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
};

export const updateCustomer = async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
};

export const addPurchase = async (id, amount) => {
    const response = await api.patch(`/customers/${id}/purchase`, { amount });
    return response.data;
};

export const fetchSegments = async () => {
    const response = await api.get('/segments');
    return response.data;
};

export const updateSegment = async (id, data) => {
    const response = await api.put(`/segments/${id}`, data);
    return response.data;
};

export default api;
