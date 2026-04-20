import { useState, useEffect } from 'react';
import { fetchSegments, updateSegment } from '../services/api';

export default function Segments() {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [submitErrorMsg, setSubmitErrorMsg] = useState('');

    useEffect(() => {
        loadSegments();
    }, []);

    const loadSegments = async () => {
        try {
            setLoading(true);
            const data = await fetchSegments();
            setSegments(data);
        } catch (err) {
            setSubmitErrorMsg('Failed to load segments.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        setSegments(segments.map(s => s._id === id ? { ...s, [field]: value === '' ? '' : Number(value) } : s));
    };

    const validateSegments = (currentSegments) => {
        let errors = {};
        
        currentSegments.forEach(seg => {
            if (seg.minPurchase === '' || seg.minPurchase < 0) {
                errors[seg._id] = "Min purchase cannot be empty or negative.";
                return;
            }
            if (seg.baseDiscount === '' || seg.baseDiscount < 0) {
                errors[seg._id] = "Base discount cannot be empty or negative.";
                return;
            }
            if (seg.incrementPerAmount === '' || seg.incrementPerAmount < 0) {
                errors[seg._id] = "Increment % cannot be empty or negative.";
                return;
            }
            if (seg.maxPurchase !== null && seg.maxPurchase !== '') {
                if (Number(seg.maxPurchase) < 0) {
                    errors[seg._id] = "Max purchase cannot be negative.";
                    return;
                }
                if (Number(seg.maxPurchase) < Number(seg.minPurchase)) {
                    errors[seg._id] = "Max purchase cannot be less than Min purchase.";
                    return;
                }
            }
        });

        // check overlaps
        const validRanges = currentSegments.filter(s => !errors[s._id] && s.minPurchase !== '');
        
        for (let i = 0; i < validRanges.length; i++) {
            for (let j = i + 1; j < validRanges.length; j++) {
                const a = validRanges[i];
                const b = validRanges[j];
                
                const aMin = Number(a.minPurchase);
                const aMax = (a.maxPurchase === null || a.maxPurchase === '') ? Infinity : Number(a.maxPurchase);
                
                const bMin = Number(b.minPurchase);
                const bMax = (b.maxPurchase === null || b.maxPurchase === '') ? Infinity : Number(b.maxPurchase);
                
                // standard overlap logic
                if (Math.max(aMin, bMin) <= Math.min(aMax, bMax)) {
                    errors[a._id] = `Range overlaps with ${b.segmentName} tier.`;
                    errors[b._id] = `Range overlaps with ${a.segmentName} tier.`;
                }
            }
        }
        
        return errors;
    };

    const validationErrors = validateSegments(segments);

    const handleSave = async (id) => {
        setSavingId(id);
        setSuccessMsg('');
        setSubmitErrorMsg('');
        try {
            const segment = segments.find(s => s._id === id);
            const dataToSave = { ...segment, maxPurchase: segment.maxPurchase === '' ? null : segment.maxPurchase };
            await updateSegment(id, dataToSave);
            setSuccessMsg(`Segment ${segment.segmentName} config updated successfully.`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setSubmitErrorMsg('Failed to update segment config.');
        } finally {
            setSavingId(null);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 mt-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-full -z-10 opacity-60"></div>
                <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">Segment Tuning</h2>
                <p className="text-gray-500 mt-2 text-base leading-relaxed max-w-2xl">
                    Adjust the minimum purchase limits and discount increment rules for dynamic segmentation.
                    These calculations apply instantly across the entire customer base.
                </p>
            </div>

            {successMsg && <div className="p-4 bg-green-50 text-green-700 font-medium rounded-xl border border-green-200 shadow-sm flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {successMsg}
            </div>}
            {submitErrorMsg && <div className="p-4 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 shadow-sm flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                {submitErrorMsg}
            </div>}

            <div className="space-y-6">
                {segments.map(segment => (
                    <div key={segment._id} className={`bg-white rounded-2xl shadow hover:shadow-md transition-shadow duration-300 overflow-hidden border ${validationErrors[segment._id] ? 'border-red-300' : 'border-gray-100'}`}>
                        <div className={`px-8 py-5 border-b flex justify-between items-center ${segment.segmentName === 'Platinum' ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-900 border-purple-200' :
                                segment.segmentName === 'Gold' ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border-amber-200' :
                                    'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-extrabold tracking-tight">
                                    {segment.segmentName} Tier
                                </h3>
                                {validationErrors[segment._id] && (
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        {validationErrors[segment._id]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 tracking-wide">PURCHASE BOUNDARIES</h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Purchase ($)</label>
                                    <input
                                        type="number"
                                        value={segment.minPurchase}
                                        onChange={(e) => handleInputChange(segment._id, 'minPurchase', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm ${validationErrors[segment._id] && segment.minPurchase === '' ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
                                        <span>Max Purchase ($)</span>
                                        <span className="text-xs text-gray-400 font-normal italic">Leave empty for infinite</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={segment.maxPurchase === null ? '' : segment.maxPurchase}
                                        onChange={(e) => handleInputChange(segment._id, 'maxPurchase', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm ${validationErrors[segment._id] && Number(segment.maxPurchase) < Number(segment.minPurchase) ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 tracking-wide">DISCOUNT RULES</h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Discount (%)</label>
                                    <input
                                        type="number" step="0.1"
                                        value={segment.baseDiscount}
                                        onChange={(e) => handleInputChange(segment._id, 'baseDiscount', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">+ Increment (%)</label>
                                        <input
                                            type="number" step="0.1"
                                            value={segment.incrementPerAmount}
                                            onChange={(e) => handleInputChange(segment._id, 'incrementPerAmount', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Per Amount ($)</label>
                                        <input
                                            type="number"
                                            value={segment.incrementUnit}
                                            onChange={(e) => handleInputChange(segment._id, 'incrementUnit', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-8 py-5 flex justify-end border-t border-gray-100">
                            <button
                                onClick={() => handleSave(segment._id)}
                                disabled={savingId !== null || !!validationErrors[segment._id]}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md shadow-indigo-200 transition-all disabled:bg-indigo-300 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                {savingId === segment._id ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
