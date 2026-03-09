import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Search, Plus, Filter, BookOpen, Clock, Users as UsersIcon, Edit2, Trash2, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import ScrollReveal from '../components/ScrollReveal';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', department: '', credits: 3, faculty: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuthStore();

    const fetchCourses = async () => {
        try { setIsLoading(true); setError(null); const { data } = await api.get('/courses'); setCourses(data || []); }
        catch (e) { setError(e.response?.data?.message || 'Failed'); setCourses([]); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchCourses();
        api.get('/departments').then(r => setDepartments(r.data || [])).catch(() => { });
        api.get('/auth/users').then(r => setFacultyList(r.data?.filter(u => u.role === 'FACULTY') || [])).catch(() => setFacultyList([]));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        try { await api.delete(`/courses/${id}`); setCourses(courses.filter(c => c._id !== id)); }
        catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    const openCreate = () => { setIsEditMode(false); setEditingId(null); setFormData({ name: '', code: '', department: '', credits: 3, faculty: '' }); setIsModalOpen(true); };
    const openEdit = (c) => { setIsEditMode(true); setEditingId(c._id); setFormData({ name: c.name, code: c.code, department: c.department?._id || c.department || '', credits: c.credits, faculty: c.faculty?._id || c.faculty || '' }); setIsModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const p = { ...formData }; if (!p.faculty) delete p.faculty;
            isEditMode ? await api.put(`/courses/${editingId}`, p) : await api.post('/courses', p);
            setIsModalOpen(false); fetchCourses();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        finally { setIsSubmitting(false); }
    };

    const filtered = useMemo(() => {
        if (!searchTerm) return courses;
        const s = searchTerm.toLowerCase();
        return courses.filter(c => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s));
    }, [courses, searchTerm]);

    return (
        <div className="space-y-6 fade-in overflow-x-hidden">
            <ScrollReveal direction="down" delay={0.1}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className="text-ocean-400" /> Course Catalog</h1>
                    <p className="text-ocean-200/50 text-sm mt-1">Manage and view all institutional courses.</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <button onClick={openCreate} className="btn-ocean px-4 py-2.5 text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Course
                    </button>
                )}
            </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
            <div className="glass-card rounded-2xl overflow-hidden">
                {error && <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-sm text-red-300">{error}</div>}
                <div className="p-4 border-b border-ocean-500/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-300/40" />
                        <input type="text" placeholder="Search courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="input-ocean !py-2 text-sm" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 flex justify-center"><div className="ocean-spinner"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-ocean-200/40"><p>No courses found.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                        {filtered.map(c => (
                            <div key={c._id} className="glass-card rounded-2xl overflow-hidden group flex flex-col shadow-lg border border-ocean-500/20">
                                <div className="h-32 w-full relative overflow-hidden bg-ocean-900/50">
                                    <img 
                                        src={`https://picsum.photos/seed/${c._id}/400/200`} 
                                        alt={c.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-deep-900 via-deep-900/50 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-ocean-500/80 text-white backdrop-blur-md shadow-lg border border-ocean-400/30">
                                            {c.code}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-white/70 hover:text-white bg-black/40 hover:bg-ocean-500/60 backdrop-blur-md rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(c._id)} className="p-1.5 text-white/70 hover:text-red-100 bg-black/40 hover:bg-red-500/60 backdrop-blur-md rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1 bg-deep-900/40">
                                    <h3 className="font-bold text-lg text-white mb-4 leading-tight">{c.name}</h3>
                                    
                                    <div className="mt-auto space-y-2.5 pt-2">
                                        <div className="flex items-center text-sm">
                                            <BookOpen className="w-4 h-4 text-ocean-400 mr-2.5 flex-shrink-0" />
                                            <span className="text-ocean-100/70">Credits: <span className="text-white font-medium">{c.credits}</span></span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <UsersIcon className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
                                            <span className="text-ocean-100/70 truncate">Dept: <span className="text-white font-medium">{c.department?.name || c.department}</span></span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <Clock className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                                            <span className="text-ocean-100/70 truncate">Faculty: {c.faculty ? <span className="text-white font-medium">{c.faculty.name || c.faculty}</span> : <span className="text-ocean-100/40 italic">Not assigned</span>}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </ScrollReveal>

            {isModalOpen && (
                <ScrollReveal direction="up" delay={0.3}>
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">{isEditMode ? 'Edit Course' : 'New Course'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Course Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-ocean !pl-4" placeholder="Data Structures" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Code</label>
                                <input type="text" required disabled={isEditMode} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="input-ocean !pl-4 disabled:opacity-40" placeholder="CS201" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Department</label>
                                <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="select-ocean">
                                    <option value="">Select</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Credits</label>
                                <input type="number" min="1" max="6" required value={formData.credits} onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })} className="input-ocean !pl-4" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Faculty (Optional)</label>
                                <select value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} className="select-ocean">
                                    <option value="">No Faculty</option>{facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                </select></div>
                            <button type="submit" disabled={isSubmitting} className="btn-ocean w-full py-3 text-sm flex justify-center mt-2">
                                {isSubmitting ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div> : (isEditMode ? 'Update Course' : 'Create Course')}
                            </button>
                        </form>
                    </div>
                </div>
                </ScrollReveal>
            )}
        </div>
    );
}
