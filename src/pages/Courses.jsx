import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { BookOpen, Search, Plus, Edit, Trash2, X } from 'lucide-react';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', code: '', department: '', credits: 3, faculty: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get('/courses');
            setCourses(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load courses');
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        // Fetch departments for the dropdown
        api.get('/departments').then(res => {
            setDepartments(res.data || []);
        }).catch(() => {});
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete course');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.faculty) delete payload.faculty;
            await api.post('/courses', payload);
            setIsModalOpen(false);
            setFormData({ name: '', code: '', department: '', credits: 3, faculty: '' });
            fetchCourses();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create course');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;
        const lower = searchTerm.toLowerCase();
        return courses.filter(course =>
            course.name.toLowerCase().includes(lower) ||
            course.code.toLowerCase().includes(lower)
        );
    }, [courses, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="text-blue-600" />
                        Manage Courses
                    </h1>
                    <p className="text-slate-500 mt-1">Add, update, or remove academic courses from the catalog.</p>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Course
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
                            <option>All Departments</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>No courses found. {searchTerm ? 'Try a different search.' : 'Add a new course to get started.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm font-medium border-b border-slate-200">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Course Name</th>
                                    <th className="px-6 py-4">Credits</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCourses.map(course => (
                                    <tr key={course._id || course.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{course.code}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{course.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                                {course.credits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {course.department?.name || course.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(course._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Course Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Add New Course</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Data Structures" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                                <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. CS201" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                                </select>
                                {departments.length === 0 && <p className="text-xs text-amber-600 mt-1">No departments found. Create a department first via Settings.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
                                <input type="number" min="1" max="6" required value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <button type="submit" disabled={isSubmitting}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4">
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create Course'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
