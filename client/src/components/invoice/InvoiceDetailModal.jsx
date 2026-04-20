import { X, Eye, FileText, User, Package, DollarSign, Calendar, Tag, Hash } from 'lucide-react';

export default function InvoiceDetailModal({ invoice, onClose }) {
    if (!invoice) return null;

    const getSegmentBadge = (segment) => {
        switch (segment) {
            case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100 shadow-sm">
                            <FileText size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Invoice Details</h2>
                            <p className="text-xs font-bold text-emerald-600 tracking-wider">{invoice.invoiceNumber}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Customer Info */}
                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Customer</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{invoice.customer?.name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-slate-400" />
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${getSegmentBadge(invoice.customerSegmentAtCreation)}`}>
                                        {invoice.customerSegmentAtCreation}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Metadata */}
                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Invoice Info</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Hash size={14} className="text-slate-400" />
                                    <span className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="font-medium text-slate-700 text-sm">
                                        {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 bg-slate-50 border-b border-slate-200">Line Items</h3>
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Item</th>
                                    <th className="px-4 py-2.5 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">Qty</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">Unit Price</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 text-sm font-bold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-slate-300" />
                                                {item.itemName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-600 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-sm font-black text-slate-800 text-right">${item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200 p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-600">Subtotal</span>
                            <span className="text-lg font-black text-slate-800">${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                            <span className="text-sm font-semibold text-green-700 flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-green-200 uppercase tracking-wider">
                                    {invoice.discountRate}% OFF
                                </span>
                                Discount Applied
                            </span>
                            <span className="text-lg font-black text-green-700">-${invoice.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center border-t-2 border-slate-300 pt-3">
                            <span className="text-base font-black text-slate-800 uppercase tracking-wide">Final Amount</span>
                            <span className="text-2xl font-black text-blue-700 tracking-tight">${invoice.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
