import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, FileText, Search, Package, ChevronDown } from 'lucide-react';
import { fetchCustomers } from '../../services/api';
import { createInvoice, updateInvoice } from '../../services/invoiceApi';

const emptyItem = { itemName: '', quantity: 1, unitPrice: 0 };

export default function InvoiceFormModal({ invoice, onClose, onSave }) {
    const isEditing = !!invoice;

    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [items, setItems] = useState([{ ...emptyItem }]);

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState({});

    // Load customers for dropdown
    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const data = await fetchCustomers();
                setCustomers(data);
            } catch (err) {
                console.error('Failed to load customers:', err);
            }
        };
        loadCustomers();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (invoice) {
            setCustomerId(invoice.customer?._id || invoice.customer || '');
            setCustomerSearch(invoice.customer?.name || '');
            setItems(invoice.items.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            })));
        }
    }, [invoice]);

    // Filter customers based on search
    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers;
        const term = customerSearch.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term)
        );
    }, [customers, customerSearch]);

    // Calculate totals
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            return sum + (qty * price);
        }, 0);
    }, [items]);

    const selectedCustomer = useMemo(() => {
        return customers.find(c => c._id === customerId);
    }, [customers, customerId]);

    // --- Item Management ---
    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const addItem = () => {
        setItems([...items, { ...emptyItem }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    // --- Customer Selection ---
    const handleSelectCustomer = (customer) => {
        setCustomerId(customer._id);
        setCustomerSearch(customer.name);
        setShowDropdown(false);
    };

    // --- Validation ---
    const validate = () => {
        const newErrors = {};

        if (!customerId) {
            newErrors.customer = 'Please select a customer';
        }

        items.forEach((item, index) => {
            if (!item.itemName.trim()) {
                newErrors[`item_${index}_name`] = 'Item name is required';
            }
            if (!item.quantity || Number(item.quantity) <= 0) {
                newErrors[`item_${index}_qty`] = 'Qty must be > 0';
            }
            if (!item.unitPrice || Number(item.unitPrice) <= 0) {
                newErrors[`item_${index}_price`] = 'Price must be > 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setSubmitError('');

        try {
            const payload = {
                customerId,
                items: items.map(item => ({
                    itemName: item.itemName.trim(),
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice)
                }))
            };

            let savedInvoice;
            if (isEditing) {
                savedInvoice = await updateInvoice(invoice._id, payload);
            } else {
                savedInvoice = await createInvoice(payload);
            }
            onSave(savedInvoice, isEditing);
        } catch (err) {
            setSubmitError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} invoice`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-100">
                            <FileText size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">
                            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50/50 overflow-y-auto flex-1">
                    {submitError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 font-medium">
                            {submitError}
                        </div>
                    )}

                    {/* Customer Selection */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                            <Search size={14} className="text-slate-400" /> Select Customer
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setShowDropdown(true);
                                    if (!e.target.value) setCustomerId('');
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow sm:text-sm font-medium text-slate-900 pr-10 ${errors.customer ? 'border-red-400' : 'border-slate-200'}`}
                                placeholder="Search by name or email..."
                            />
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        {errors.customer && <p className="text-red-500 text-xs mt-1 font-medium">{errors.customer}</p>}

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {filteredCustomers.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-slate-400 text-center">No customers found</div>
                                ) : (
                                    filteredCustomers.map(c => (
                                        <button
                                            key={c._id}
                                            type="button"
                                            onClick={() => handleSelectCustomer(c)}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between gap-2 ${customerId === c._id ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''}`}
                                        >
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{c.name}</div>
                                                <div className="text-xs text-slate-500">{c.email}</div>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${c.segment === 'Platinum' ? 'bg-purple-50 text-purple-700 border-purple-200' : c.segment === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                {c.segment}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Close dropdown on outside click */}
                    {showDropdown && (
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    )}

                    {/* Items Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                <Package size={14} className="text-slate-400" /> Invoice Items
                            </label>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                            >
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        {/* Item Name */}
                                        <div className="flex-[2]">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Item Name</label>
                                            <input
                                                type="text"
                                                value={item.itemName}
                                                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                placeholder="e.g. Organic Rice"
                                                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[`item_${index}_name`] ? 'border-red-300' : 'border-slate-200'}`}
                                            />
                                            {errors[`item_${index}_name`] && <p className="text-red-500 text-[10px] mt-0.5">{errors[`item_${index}_name`]}</p>}
                                        </div>

                                        {/* Quantity */}
                                        <div className="flex-[0.7]">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[`item_${index}_qty`] ? 'border-red-300' : 'border-slate-200'}`}
                                            />
                                            {errors[`item_${index}_qty`] && <p className="text-red-500 text-[10px] mt-0.5">{errors[`item_${index}_qty`]}</p>}
                                        </div>

                                        {/* Unit Price */}
                                        <div className="flex-[1]">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Price ($)</label>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[`item_${index}_price`] ? 'border-red-300' : 'border-slate-200'}`}
                                            />
                                            {errors[`item_${index}_price`] && <p className="text-red-500 text-[10px] mt-0.5">{errors[`item_${index}_price`]}</p>}
                                        </div>

                                        {/* Line Total + Remove */}
                                        <div className="flex flex-col items-end pt-5 flex-[0.5]">
                                            <span className="text-sm font-black text-slate-800 mb-1">
                                                ${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subtotal Display */}
                    <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-xl border border-slate-200 p-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
                        <span className="text-xl font-black text-slate-800 tracking-tight">
                            ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {selectedCustomer && (
                        <div className="bg-blue-50/60 rounded-lg border border-blue-100 p-3 flex items-center gap-3 text-xs text-blue-700">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></div>
                            <p className="leading-relaxed">
                                <strong>{selectedCustomer.name}</strong>'s current segment is <strong>{selectedCustomer.segment}</strong> (${selectedCustomer.totalPurchaseAmount?.toLocaleString() || 0} total). Discount will be recalculated dynamically at save.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 border border-transparent rounded-lg shadow-md shadow-emerald-500/30 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-400 disabled:shadow-none transition-all"
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Create Invoice')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
