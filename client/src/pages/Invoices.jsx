import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchInvoices, deleteInvoice } from '../services/invoiceApi';
import InvoiceFormModal from '../components/invoice/InvoiceFormModal';
import InvoiceDetailModal from '../components/invoice/InvoiceDetailModal';

export default function Invoices({ user }) {
    const [invoiceData, setInvoiceData] = useState({ invoices: [], currentPage: 1, totalPages: 1, totalInvoices: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);

    const isSales = user?.role === 'sales_staff';

    useEffect(() => {
        loadInvoices();
    }, [currentPage, searchTerm]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await fetchInvoices(currentPage, 7, searchTerm);
            setInvoiceData(data);
        } catch (err) {
            console.error('Failed to load invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingInvoice(null);
        setFormModalOpen(true);
    };

    const handleEdit = (invoice, e) => {
        e.stopPropagation();
        setEditingInvoice(invoice);
        setFormModalOpen(true);
    };

    const handleDelete = async (invoice, e) => {
        e.stopPropagation();
        if (window.confirm(`Delete invoice ${invoice.invoiceNumber}? This will revert the customer's purchase total. This action cannot be undone.`)) {
            try {
                await deleteInvoice(invoice._id);
                loadInvoices();
            } catch (err) {
                alert(err?.response?.data?.message || 'Failed to delete invoice.');
            }
        }
    };

    const handleSaveInvoice = () => {
        setFormModalOpen(false);
        setEditingInvoice(null);
        loadInvoices();
    };

    const getSegmentBadge = (segment) => {
        switch (segment) {
            case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200 border';
            case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-300 border shadow-sm';
            default: return 'bg-slate-100 text-slate-700 border-slate-200 border';
        }
    };

    if (loading && invoiceData.invoices.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 opacity-70"></div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Invoices</h3>
                    <div className="text-4xl font-black text-slate-800 tracking-tight">{invoiceData.totalInvoices}</div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 font-semibold bg-emerald-50 self-start px-2 py-1 rounded-md border border-emerald-100 w-fit">
                        <FileText size={14} />
                        <span>All Records</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 opacity-70"></div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Current Page</h3>
                    <div className="text-4xl font-black text-slate-800 tracking-tight">{invoiceData.currentPage} <span className="text-lg text-slate-400 font-bold">/ {invoiceData.totalPages}</span></div>
                    <div className="mt-3 text-xs text-slate-500 font-medium">
                        Showing {invoiceData.invoices.length} of {invoiceData.totalInvoices} total
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 opacity-70"></div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Your Role</h3>
                    <div className="text-2xl font-black text-slate-800 tracking-tight capitalize">{user?.role?.replace('_', ' ')}</div>
                    <div className={`mt-3 text-xs font-bold px-2 py-1 rounded-md border w-fit ${isSales ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'}`}>
                        {isSales ? 'Full Access (CRUD)' : 'Read Only'}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-all"
                            placeholder="Search by invoice number..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    {isSales && (
                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition w-full sm:w-auto focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <Plus size={16} /> Create Invoice
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Invoice #</th>
                                <th className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Customer</th>
                                <th className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Items</th>
                                <th className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Subtotal</th>
                                <th className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Final Amount</th>
                                <th className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Date</th>
                                <th className="relative px-6 py-3.5 justify-end"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {invoiceData.invoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                <FileText size={14} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-sm font-black text-slate-800 tracking-tight">{invoice.invoiceNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                            {invoice.customer?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-slate-500">{invoice.customer?.email || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-bold border border-slate-200">
                                            {invoice.items?.length || 0} item{(invoice.items?.length || 0) !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-slate-600">${invoice.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-black text-slate-800 tracking-tight">${invoice.finalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        {invoice.discountRate > 0 && (
                                            <div className="text-[10px] text-green-700 font-bold bg-green-50 inline-flex px-1.5 py-0.5 rounded shadow-sm border border-green-100 mt-1 uppercase tracking-wider">{invoice.discountRate}% OFF</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        {new Date(invoice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isSales && (
                                                <>
                                                    <button
                                                        onClick={(e) => handleEdit(invoice, e)}
                                                        className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-md hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100 bg-white shadow-sm"
                                                        title="Edit Invoice"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(invoice, e)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 bg-white shadow-sm"
                                                        title="Delete Invoice"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); }}
                                                className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 bg-white shadow-sm"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {invoiceData.invoices.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                <FileText size={32} strokeWidth={1.5} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">No invoices found</p>
                                            <p className="text-xs mt-1">
                                                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first invoice to get started.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {invoiceData.totalPages > 1 && (
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-600">
                                Page <span className="font-bold text-slate-900">{invoiceData.currentPage}</span> of <span className="font-bold text-slate-900">{invoiceData.totalPages}</span> — <span className="font-bold text-slate-900">{invoiceData.totalInvoices}</span> total invoices
                            </p>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm overflow-hidden" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-3 py-1.5 border border-r-0 border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors gap-1"
                                    >
                                        <ChevronLeft size={14} /> Previous
                                    </button>

                                    {Array.from({ length: invoiceData.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-semibold transition-colors ${currentPage === page
                                                ? 'z-10 bg-emerald-50 text-emerald-700 border-emerald-300 shadow-inner'
                                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(invoiceData.totalPages, p + 1))}
                                        disabled={currentPage === invoiceData.totalPages}
                                        className="relative inline-flex items-center px-3 py-1.5 border border-l-0 border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors gap-1"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedInvoice && (
                <InvoiceDetailModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}

            {formModalOpen && (
                <InvoiceFormModal
                    invoice={editingInvoice}
                    onClose={() => { setFormModalOpen(false); setEditingInvoice(null); }}
                    onSave={handleSaveInvoice}
                />
            )}
        </div>
    );
}
