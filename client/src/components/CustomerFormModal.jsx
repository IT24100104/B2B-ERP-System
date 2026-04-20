import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import { createCustomer, updateCustomer } from '../services/api';

export default function CustomerFormModal({ customer, onClose, onSave }) {
    const isEditing = !!customer;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                country: customer.country
            });
        }
    }, [customer]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = 'Invalid email format';
            }
        } else if (name === 'phone') {
            if (!/^\d*$/.test(value)) {
                error = 'Only numbers allowed';
            } else if (value.length > 0 && (value.length < 7 || value.length > 15)) {
                error = 'Must be 7-15 digits';
            }
        } else if (name === 'country') {
            if (!/^[A-Za-z\s]*$/.test(value)) {
                error = 'Only letters and spaces allowed';
            } else if (value.trim().length > 0 && value.trim().length < 2) {
                error = 'Must be at least 2 characters';
            }
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        const fieldError = validateField(name, value);
        if (fieldError) {
            setErrors(prev => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const fieldError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'name') {
                const err = validateField(key, formData[key]);
                if (err) newErrors[key] = err;
            }
            if (!formData[key]) {
                newErrors[key] = 'Required';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ email: true, phone: true, country: true, name: true });
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            let savedCustomer;
            if (isEditing) {
                savedCustomer = await updateCustomer(customer._id, formData);
            } else {
                savedCustomer = await createCustomer(formData);
            }
            onSave(savedCustomer, isEditing);
        } catch (err) {
            setSubmitError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} customer`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100">
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">
                            {isEditing ? 'Edit Customer' : 'Add New Customer'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50/50">
                    {submitError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 font-medium">
                            {submitError}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                            <User size={14} className="text-slate-400" /> Full Name
                        </label>
                        <input
                            type="text" required name="name"
                            value={formData.name} onChange={handleChange} onBlur={handleBlur}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow sm:text-sm font-medium text-slate-900"
                            placeholder="e.g. Acme Corp"
                        />
                        {touched.name && errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" /> Email Address
                        </label>
                        <input
                            type="text" required name="email"
                            value={formData.email} onChange={handleChange} onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow sm:text-sm font-medium text-slate-900 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                            placeholder="e.g. contact@acme.com"
                        />
                        {touched.email && errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" /> Phone Number
                        </label>
                        <input
                            type="text" required name="phone"
                            value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow sm:text-sm font-medium text-slate-900 ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                            placeholder="e.g. 1234567890"
                        />
                        {touched.phone && errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" /> Country
                        </label>
                        <input
                            type="text" required name="country"
                            value={formData.country} onChange={handleChange} onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow sm:text-sm font-medium text-slate-900 ${errors.country ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                            placeholder="e.g. United States"
                        />
                        {touched.country && errors.country && <p className="text-red-500 text-xs mt-1 font-medium">{errors.country}</p>}
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-200 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || Object.keys(errors).some(k => errors[k])}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-lg shadow-md shadow-blue-500/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:shadow-none transition-all"
                        >
                            {loading ? 'Saving...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
