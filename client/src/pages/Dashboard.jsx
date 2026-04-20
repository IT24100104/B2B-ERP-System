import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Eye, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { fetchCustomers, deleteCustomer } from '../services/api';
import CustomerModal from '../components/CustomerModal';
import CustomerFormModal from '../components/CustomerFormModal';

const ITEMS_PER_PAGE = 7;

export default function Dashboard({ user }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // For Create / Edit
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await fetchCustomers();
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter & Search Logic
    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;

        const term = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.country.toLowerCase().includes(term) ||
            c.segment.toLowerCase() === term // Exact segment
        );
    }, [customers, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1); // Reset page on search
    }, [searchTerm]);

    // Chart Data preparation
    const chartData = useMemo(() => {
        const counts = { Normal: 0, Gold: 0, Platinum: 0 };
        customers.forEach(c => {
            if (counts[c.segment] !== undefined) counts[c.segment]++;
        });

        return [
            { name: 'Normal', value: counts.Normal, color: '#94A3B8' }, // slate-400
            { name: 'Gold', value: counts.Gold, color: '#FCD34D' }, // amber-300
            { name: 'Platinum', value: counts.Platinum, color: '#A78BFA' } // purple-400
        ].filter(d => d.value > 0);
    }, [customers]);

    const handleCreateNew = () => {
        setEditingCustomer(null);
        setFormModalOpen(true);
    };

    const handleDelete = async (customer, e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to permanently delete ${customer.name}? This action cannot be undone.`)) {
            try {
                await deleteCustomer(customer._id);
                setCustomers(prev => prev.filter(c => c._id !== customer._id));
            } catch (err) {
                alert('Failed to delete customer.');
            }
        }
    };

    const handleEdit = (customer, e) => {
        e.stopPropagation();
        setEditingCustomer(customer);
        setFormModalOpen(true);
    };

    const handleSaveCustomer = (savedCustomer, isEditing) => {
        if (isEditing) {
            setCustomers(prev => prev.map(c => c._id === savedCustomer._id ? savedCustomer : c).sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount));
        } else {
            setCustomers(prev => [savedCustomer, ...prev].sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount));
        }
        setFormModalOpen(false);
    };

    const getSegmentBadge = (segment) => {
        switch (segment) {
            case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200 border';
            case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-300 border shadow-sm';
            default: return 'bg-slate-100 text-slate-700 border-slate-200 border';
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Section: Metrics and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Metric */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-70"></div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Managed Customers</h3>
                    <div className="text-5xl font-black text-slate-800 tracking-tight">{customers.length}</div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-50 self-start px-2 py-1 rounded-md border border-green-100">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Segments Up to Date</span>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 lg:col-span-2 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div className="pr-4 hidden md:block w-1/3">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Segment Distribution</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Customers are categorized into logic-based tiers by their total lifetime purchase volume automatically.</p>
                    </div>
                    <div className="h-64 flex-1 min-w-0 -my-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    cornerIsRadius={true}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={true}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                            placeholder="Search by name, country, or specific segment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isAdmin && (
                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition w-full sm:w-auto focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus size={16} /> Create Customer
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Customer Profile</th>
                                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Country</th>
                                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Purchases</th>
                                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase">Segment</th>
                                <th scope="col" className="relative px-6 py-3.5 justify-end"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {paginatedCustomers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase border border-slate-200">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</div>
                                                <div className="text-xs text-slate-500">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-700">{customer.country}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-black text-slate-800 tracking-tight">${customer.totalPurchaseAmount.toLocaleString()}</div>
                                        <div className="text-[10px] text-green-700 font-bold bg-green-50 inline-flex px-1.5 py-0.5 rounded shadow-sm border border-green-100 mt-1 uppercase tracking-wider">{customer.discountRate}% OFF</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-wider rounded-md ${getSegmentBadge(customer.segment)}`}>
                                            {customer.segment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={(e) => handleEdit(customer, e)}
                                                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 bg-white shadow-sm"
                                                        title="Edit Customer"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(customer, e)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 bg-white shadow-sm"
                                                        title="Delete Customer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                                                className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 bg-white shadow-sm"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedCustomers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                <Search size={32} strokeWidth={1.5} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">No customers found</p>
                                            <p className="text-xs mt-1">Try adjusting your search criteria or add a new customer.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination mb-0 */}
                {totalPages > 1 && (
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-slate-600">
                                    Showing <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)}</span> of <span className="font-bold text-slate-900">{filteredCustomers.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm overflow-hidden" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-3 py-1.5 border border-r-0 border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-semibold transition-colors ${currentPage === page
                                                ? 'z-10 bg-blue-50 text-blue-700 border-blue-300 shadow-inner'
                                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-3 py-1.5 border border-l-0 border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}

            {formModalOpen && (
                <CustomerFormModal
                    customer={editingCustomer}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveCustomer}
                />
            )}
        </div>
    );
}
