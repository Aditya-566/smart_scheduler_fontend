import { useState, useEffect, useMemo } from 'react';

import { BookOpen, Search, Plus, MapPin, Edit, Trash2 } from 'lucide-react';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock fetch to simulate dynamic loading
        setTimeout(() => {
            setCourses([
                { id: 1, code: 'CS-101', name: 'Introduction to Computer Science', credits: 4, department: 'CS', faculty: 'Dr. Smith' },
                { id: 2, code: 'CS-201', name: 'Data Structures', credits: 3, department: 'CS', faculty: 'Prof. Alan' },
                { id: 3, code: 'EE-101', name: 'Basic Electrical Eng', credits: 3, department: 'EE', faculty: 'Dr. Tesla' }
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    // Performance Optimization: useMemo for filtering
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

                <button className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Course
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                            <option>CS</option>
                            <option>EE</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
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
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{course.code}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{course.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                                {course.credits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {course.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        </div>
    );
}
