import { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Plus, Trash2, Clock, Building2, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Settings() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    const [departments, setDepartments] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(true);

    // Department form
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
    const [deptSubmitting, setDeptSubmitting] = useState(false);

    // TimeSlot seeding
    const [seeding, setSeeding] = useState(false);

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            setDepartments(data || []);
        } catch { setDepartments([]); }
        finally { setLoadingDepts(false); }
    };

    const fetchTimeSlots = async () => {
        try {
            const { data } = await api.get('/timeslots');
            setTimeSlots(data || []);
        } catch { setTimeSlots([]); }
        finally { setLoadingSlots(false); }
    };

    useEffect(() => {
        fetchDepartments();
        fetchTimeSlots();
    }, []);

    const handleCreateDept = async (e) => {
        e.preventDefault();
        setDeptSubmitting(true);
        try {
            await api.post('/departments', deptForm);
            setDeptForm({ name: '', code: '', description: '' });
            setShowDeptForm(false);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create department');
        } finally {
            setDeptSubmitting(false);
        }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            setDepartments(departments.filter(d => d._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleSeedSlots = async () => {
        setSeeding(true);
        try {
            const { data } = await api.post('/timeslots/seed');
            alert(data.message);
            fetchTimeSlots();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to seed time slots');
        } finally {
            setSeeding(false);
        }
    };

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <SettingsIcon className="text-slate-600" />
                    Settings
                </h1>
                <p className="text-slate-500 mt-1">Manage departments, time slots, and system configuration.</p>
            </div>

            {/* Departments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Building2 className="text-blue-600 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-900">Departments</h2>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setShowDeptForm(!showDeptForm)} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Department
                        </button>
                    )}
                </div>

                {showDeptForm && (
                    <form onSubmit={handleCreateDept} className="p-6 border-b border-slate-100 bg-blue-50/30 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" required placeholder="Department Name" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                                className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="text" required placeholder="Code (e.g. CS, EE)" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})}
                                className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="text" placeholder="Description (optional)" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})}
                                className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={deptSubmitting} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {deptSubmitting ? 'Creating...' : 'Create'}
                            </button>
                            <button type="button" onClick={() => setShowDeptForm(false)} className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100">Cancel</button>
                        </div>
                    </form>
                )}

                <div className="p-6">
                    {loadingDepts ? (
                        <div className="text-center text-slate-500">Loading...</div>
                    ) : departments.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">No departments yet. Add one to get started.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {departments.map(dept => (
                                <div key={dept._id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center hover:border-blue-300 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{dept.name}</h3>
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{dept.code}</span>
                                    </div>
                                    {isAdmin && (
                                        <button onClick={() => handleDeleteDept(dept._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Time Slots Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Clock className="text-amber-600 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-900">Time Slots</h2>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{timeSlots.length} slots</span>
                    </div>
                    {isAdmin && timeSlots.length === 0 && (
                        <button onClick={handleSeedSlots} disabled={seeding}
                            className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1">
                            {seeding ? 'Seeding...' : <><Plus className="w-4 h-4" /> Seed Default Slots (Mon-Fri)</>}
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {loadingSlots ? (
                        <div className="text-center text-slate-500">Loading...</div>
                    ) : timeSlots.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">
                            No time slots configured. Click "Seed Default Slots" to auto-create Mon-Fri, 08:00-17:00 hourly slots.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <th className="px-4 py-3">Day</th>
                                        <th className="px-4 py-3">Start Time</th>
                                        <th className="px-4 py-3">End Time</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {timeSlots.map(slot => (
                                        <tr key={slot._id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2 font-medium">{DAYS[slot.dayOfWeek]}</td>
                                            <td className="px-4 py-2">{slot.startTime}</td>
                                            <td className="px-4 py-2">{slot.endTime}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${slot.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {slot.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
