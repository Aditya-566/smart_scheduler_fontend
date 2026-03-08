import { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Clock, User, MapPin } from 'lucide-react';

export default function FacultyCourses() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/courses/faculty/my-courses');
                setCourses(data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-ocean-400" /> My Courses
                </h1>
                <p className="text-ocean-200/50 text-sm mt-1">Courses assigned to you by the admin.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="ocean-spinner"></div></div>
            ) : courses.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-ocean-400/30" />
                    <h3 className="text-lg font-bold text-white mb-1">No Courses Assigned</h3>
                    <p className="text-ocean-200/40 text-sm">No courses have been assigned to you yet. Contact your admin to get courses assigned.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, i) => (
                        <div key={course._id} className="glass-card rounded-2xl p-6 group hover:border-ocean-500/20 transition-all duration-300"
                            style={{ animationDelay: `${i * 0.08}s` }}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-ocean-400 to-blue-500 text-white shadow-lg shadow-ocean-500/15">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-ocean-500/10 text-ocean-300 text-xs font-bold border border-ocean-500/15">
                                    {course.code}
                                </span>
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2 leading-tight">{course.name}</h3>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-sm text-ocean-200/50">
                                    <Clock className="w-3.5 h-3.5 text-ocean-400/60" />
                                    <span>{course.credits} Credit{course.credits > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-ocean-200/50">
                                    <MapPin className="w-3.5 h-3.5 text-ocean-400/60" />
                                    <span>{course.department?.name || 'Department'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
