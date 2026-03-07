import { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Plus, Trash2, Clock, X } from 'lucide-react';

export default function Settings() {
    const [departments, setDepartments] = useState([]);
    const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedMsg, setSeedMsg] = useState('');

    useEffect(() => {
        api.get('/departments').then(r => setDepartments(r.data || [])).catch(() => { });
    }, []);

    const handleAddDept = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const { data } = await api.post('/departments', newDept);
            setDepartments([...departments, data]);
            setNewDept({ name: '', code: '', description: '' });
            setIsDeptModalOpen(false);
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try { await api.delete(`/departments/${id}`); setDepartments(departments.filter(d => d._id !== id)); }
        catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    const handleSeedSlots = async () => {
        setIsSeeding(true); setSeedMsg('');
        try {
            const { data } = await api.post('/timeslots/seed');
            setSeedMsg(data.message || `Seeded ${data.count || ''} time slots!`);
        } catch (e) { setSeedMsg(e.response?.data?.message || 'Failed to seed'); }
        finally { setIsSeeding(false); }
    };

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2"><SettingsIcon className="text-ocean-400" /> Settings</h1>
                <p className="text-ocean-200/50 text-sm mt-1">Manage departments, time slots, and system configuration.</p>
            </div>

            {/* Departments */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-white">Departments</h3>
                    <button onClick={() => setIsDeptModalOpen(true)} className="btn-ocean px-3 py-2 text-sm flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                </div>

                {departments.length === 0 ? (
                    <p className="text-ocean-200/40 text-sm text-center py-4">No departments yet. Add one to get started.</p>
                ) : (
                    <div className="space-y-2">
                        {departments.map(d => (
                            <div key={d._id} className="glass-light rounded-xl p-4 flex justify-between items-center group">
                                <div>
                                    <p className="font-semibold text-white text-sm">{d.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md text-xs bg-ocean-500/10 text-ocean-300 border border-ocean-500/15 font-mono">{d.code}</span>
                                        {d.description && <span className="text-xs text-ocean-200/30">{d.description}</span>}
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteDept(d._id)}
                                    className="p-2 text-ocean-300/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Time Slots */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-ocean-400" /> Time Slots
                </h3>
                <p className="text-ocean-200/50 text-sm mb-4">
                    Seed default 1-hour time slots for Mon–Fri (08:00–17:00). This is required before generating schedules.
                </p>
                {seedMsg && (
                    <div className={`mb-4 p-3 rounded-xl text-sm border ${seedMsg.includes('Failed') ? 'bg-red-500/15 text-red-300 border-red-500/20' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'}`}>
                        {seedMsg}
                    </div>
                )}
                <button onClick={handleSeedSlots} disabled={isSeeding} className="btn-ocean px-4 py-2.5 text-sm flex items-center gap-2">
                    {isSeeding ? <div className="ocean-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div> : <><Clock className="w-4 h-4" /> Seed Default Slots (Mon-Fri)</>}
                </button>
            </div>

            {/* Add Department Modal */}
            {isDeptModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Add Department</h2>
                            <button onClick={() => setIsDeptModalOpen(false)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleAddDept} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Name</label>
                                <input type="text" required value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} className="input-ocean !pl-4" placeholder="Computer Science Engineering" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Code</label>
                                <input type="text" required value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value })} className="input-ocean !pl-4" placeholder="CS" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Description (Optional)</label>
                                <input type="text" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} className="input-ocean !pl-4" placeholder="Optional description" /></div>
                            <button type="submit" disabled={isSubmitting} className="btn-ocean w-full py-3 text-sm flex justify-center mt-2">
                                {isSubmitting ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div> : 'Add Department'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
