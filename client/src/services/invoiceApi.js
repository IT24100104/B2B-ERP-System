import api from './api';

// GET /api/invoices?page=&limit=&search=
export const fetchInvoices = async (page = 1, limit = 7, search = '') => {
    const response = await api.get('/invoices', { params: { page, limit, search } });
    return response.data;
};

// GET /api/invoices/:id
export const fetchInvoiceById = async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
};

// POST /api/invoices
export const createInvoice = async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
};

// PUT /api/invoices/:id
export const updateInvoice = async (id, data) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
};

// DELETE /api/invoices/:id
export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
};
