import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Tag } from 'lucide-react';

export default function CustomerModal({ customer, onClose }) {
    if (!customer) return null;

    const getSegmentColor = (segment) => {
        switch (segment) {
            case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                {/* Header */}
                <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 shadow-sm">
                            <User size={22} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Customer Profile</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Contact Info */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Profile Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                        <User className="text-slate-400 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                                            <p className="font-bold text-slate-900">{customer.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                        <Mail className="text-slate-400 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                                            <p className="font-bold text-slate-900">{customer.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                        <Phone className="text-slate-400 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                                            <p className="font-bold text-slate-900">{customer.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                        <MapPin className="text-slate-400 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Country</p>
                                            <p className="font-bold text-slate-900">{customer.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Metrics */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Business Metrics</h3>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Tag size={16} />
                                            <span className="text-sm font-bold">Tier Segment</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-black border uppercase tracking-wider ${getSegmentColor(customer.segment)}`}>
                                            {customer.segment}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <CreditCard size={16} />
                                            <span className="text-sm font-bold">Total Purchases</span>
                                        </div>
                                        <span className="font-black text-2xl text-slate-800 tracking-tight">
                                            ${customer.totalPurchaseAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 bg-green-50/80 -mx-5 px-5 pb-1 mt-2">
                                        <span className="text-xs text-slate-600 font-bold tracking-wide flex items-center gap-2">
                                            Calculated Discount
                                        </span>
                                        <span className="font-black text-[13px] text-green-700 bg-white border border-green-200 px-2.5 py-1 rounded-md shadow-sm">
                                            {customer.discountRate}% OFF
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-start gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                    <Calendar className="text-slate-400 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Registered On</p>
                                        <p className="font-bold text-slate-900">{new Date(customer.registrationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note regarding purchases */}
                    <div className="mt-8 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-600 font-medium bg-blue-50/50 -mx-6 -mb-6 p-5 rounded-b-2xl border-t-blue-100 border-x-0 border-b-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-0.5 flex-shrink-0 animate-pulse"></div>
                        <p className="leading-relaxed">Purchase tracking and additions are managed entirely through the <strong className="text-slate-800">Sales & Invoice Management</strong> module to ensure integration consistency.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
