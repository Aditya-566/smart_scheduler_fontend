import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, X, Trash2, AlertTriangle } from 'lucide-react';

export default function Timetable() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generate Modal State
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [roomsList, setRoomsList] = useState([]);
    const [generateConfig, setGenerateConfig] = useState({
        departmentId: '',
        maxClassesPerDay: 4,
        availableRooms: [],
        batchInfo: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);
    const [generateError, setGenerateError] = useState(null);

    // Assign Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignSlot, setAssignSlot] = useState({ dayOfWeek: null, startTime: null, endTime: null });
    const [coursesList, setCoursesList] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [assignRooms, setAssignRooms] = useState([]);
    const [timeSlotsList, setTimeSlotsList] = useState([]);
    const [assignForm, setAssignForm] = useState({
        course: '', room: '', faculty: '', timeSlot: '', batchInfo: ''
    });
    const [isAssigning, setIsAssigning] = useState(false);

    // Detail/Delete Modal State
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const TIME_SLOTS = [
        '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
    ];

    const fetchSchedules = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/schedules');
            setSchedules(data);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const getScheduleForSlot = (dayIdx, timeSlotStr) => {
        const startTimeStr = timeSlotStr.split(' - ')[0];
        return schedules.find(s =>
            s.timeSlot?.dayOfWeek === dayIdx && s.timeSlot?.startTime === startTimeStr
        );
    };

    // --- Generate Schedule Modal ---
    const openGenerateModal = async () => {
        setIsGenerateModalOpen(true);
        setGenerateResult(null);
        setGenerateError(null);
        try {
            const [deptRes, roomRes] = await Promise.all([
                api.get('/schedules/departments'),
                api.get('/schedules/rooms')
            ]);
            setDepartments(deptRes.data);
            setRoomsList(roomRes.data);
            if (deptRes.data.length > 0) {
                setGenerateConfig(prev => ({ ...prev, departmentId: deptRes.data[0]._id }));
            }
            setGenerateConfig(prev => ({ ...prev, availableRooms: roomRes.data.map(r => r._id) }));
        } catch (err) {
            console.error('Failed to fetch modal data', err);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerateError(null);
        try {
            const payload = {
                maxClassesPerDay: generateConfig.maxClassesPerDay,
                availableRooms: generateConfig.availableRooms
            };
            if (generateConfig.batchInfo.trim()) {
                payload.batchInfo = generateConfig.batchInfo.trim();
            }
            const { data } = await api.post(`/schedules/generate/${generateConfig.departmentId}`, payload);
            setGenerateResult(data);
            fetchSchedules();
        } catch (err) {
            setGenerateError(err.response?.data?.message || err.message || 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Manual Assign Modal ---
    const openAssignModal = async (dayIdx, timeSlotStr) => {
        setIsAssignModalOpen(true);
        const startTime = timeSlotStr.split(' - ')[0];
        const endTime = timeSlotStr.split(' - ')[1];
        setAssignSlot({ dayOfWeek: dayIdx, startTime, endTime });

        try {
            const [coursesRes, facultyRes, roomsRes, timeslotsRes] = await Promise.all([
                api.get('/schedules/courses'),
                api.get('/schedules/faculty'),
                api.get('/schedules/rooms'),
                api.get('/schedules/timeslots')
            ]);
            setCoursesList(coursesRes.data);
            setFacultyList(facultyRes.data);
            setAssignRooms(roomsRes.data);
            setTimeSlotsList(timeslotsRes.data);

            // Auto-select the matching timeslot
            const matchingSlot = timeslotsRes.data.find(
                ts => ts.dayOfWeek === dayIdx && ts.startTime === startTime && ts.endTime === endTime
            );
            setAssignForm({
                course: coursesRes.data.length > 0 ? coursesRes.data[0]._id : '',
                room: roomsRes.data.length > 0 ? roomsRes.data[0]._id : '',
                faculty: '',
                timeSlot: matchingSlot ? matchingSlot._id : '',
                batchInfo: ''
            });
        } catch (err) {
            console.error('Failed to fetch assign data', err);
        }
    };

    const handleAssign = async () => {
        if (!assignForm.course || !assignForm.room || !assignForm.timeSlot || !assignForm.batchInfo.trim()) {
            alert('Please fill in all required fields (Course, Room, Time Slot, and Batch Info).');
            return;
        }
        setIsAssigning(true);
        try {
            const payload = {
                course: assignForm.course,
                room: assignForm.room,
                timeSlot: assignForm.timeSlot,
                batchInfo: assignForm.batchInfo.trim()
            };
            if (assignForm.faculty) {
                payload.faculty = assignForm.faculty;
            }
            await api.post('/schedules/manual', payload);
            setIsAssignModalOpen(false);
            fetchSchedules();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to assign schedule');
        } finally {
            setIsAssigning(false);
        }
    };

    // --- Delete Schedule ---
    const handleDelete = async (id) => {
        setIsDeleting(true);
        try {
            await api.delete(`/schedules/${id}`);
            setSelectedSchedule(null);
            fetchSchedules();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Clear All Schedules ---
    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear ALL schedules? This cannot be undone.')) return;
        try {
            await api.delete('/schedules/all');
            fetchSchedules();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to clear schedules');
        }
    };

    // Color palette for schedule cards
    const cardColors = [
        { bg: 'bg-indigo-50', border: 'border-indigo-100', hoverBorder: 'hover:border-indigo-300', title: 'text-indigo-900', code: 'text-indigo-600' },
        { bg: 'bg-emerald-50', border: 'border-emerald-100', hoverBorder: 'hover:border-emerald-300', title: 'text-emerald-900', code: 'text-emerald-600' },
        { bg: 'bg-amber-50', border: 'border-amber-100', hoverBorder: 'hover:border-amber-300', title: 'text-amber-900', code: 'text-amber-600' },
        { bg: 'bg-rose-50', border: 'border-rose-100', hoverBorder: 'hover:border-rose-300', title: 'text-rose-900', code: 'text-rose-600' },
        { bg: 'bg-sky-50', border: 'border-sky-100', hoverBorder: 'hover:border-sky-300', title: 'text-sky-900', code: 'text-sky-600' },
        { bg: 'bg-violet-50', border: 'border-violet-100', hoverBorder: 'hover:border-violet-300', title: 'text-violet-900', code: 'text-violet-600' },
    ];

    const getCardColor = (courseCode) => {
        if (!courseCode) return cardColors[0];
        let hash = 0;
        for (let i = 0; i < courseCode.length; i++) hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
        return cardColors[Math.abs(hash) % cardColors.length];
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Weekly Timetable
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {user?.role === 'ADMIN' ? 'System-wide schedule overview' : 'Your personal weekly schedule'}
                    </p>
                </div>

                {user?.role === 'ADMIN' && (
                    <div className="flex gap-3">
                        {schedules.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="px-4 py-2 text-red-600 font-medium rounded-xl hover:bg-red-50 border border-red-200 transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={openGenerateModal}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                        >
                            + Generate Schedule
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-r border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm w-24">
                                    Time
                                </th>
                                {DAYS.slice(1, 6).map((day, i) => (
                                    <th key={i} className="p-4 border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-center min-w-[200px]">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((time, timeIdx) => (
                                <tr key={timeIdx} className="group">
                                    <td className="p-4 border-b border-r border-slate-200 bg-slate-50 text-slate-500 font-medium text-xs text-center whitespace-nowrap">
                                        {time}
                                    </td>

                                    {DAYS.slice(1, 6).map((day, dayIdx) => {
                                        const actualDayIdx = dayIdx + 1;
                                        const scheduleItem = getScheduleForSlot(actualDayIdx, time);
                                        const colors = scheduleItem ? getCardColor(scheduleItem.course?.code) : null;

                                        return (
                                            <td key={actualDayIdx} className="p-2 border-b border-slate-100 border-r last:border-r-0 relative group/cell hover:bg-slate-50 transition-colors h-32 align-top">
                                                {scheduleItem ? (
                                                    <div
                                                        onClick={() => setSelectedSchedule(scheduleItem)}
                                                        className={`h-full rounded-xl ${colors.bg} border ${colors.border} p-3 flex flex-col justify-between shadow-sm cursor-pointer ${colors.hoverBorder} hover:shadow-md transition-all`}
                                                    >
                                                        <div>
                                                            <div className={`font-bold ${colors.title} text-sm mb-1 leading-tight line-clamp-2`}>
                                                                {scheduleItem.course?.name || 'Class Assigned'}
                                                            </div>
                                                            <div className={`text-xs font-semibold ${colors.code} mb-2`}>
                                                                {scheduleItem.course?.code || ''}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 text-xs text-slate-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span className="truncate">{scheduleItem.room?.number || 'TBA'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <UserIcon className="w-3.5 h-3.5" />
                                                                <span className="truncate">{scheduleItem.faculty?.name || 'Faculty TBA'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover/cell:opacity-100 flex items-center justify-center h-full">
                                                        {user?.role === 'ADMIN' && (
                                                            <button
                                                                onClick={() => openAssignModal(actualDayIdx, time)}
                                                                className="text-xs font-medium text-slate-400 border border-dashed border-slate-300 rounded px-2 py-1 hover:text-blue-500 hover:border-blue-400 transition-colors"
                                                            >
                                                                + Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ======= GENERATE SCHEDULE MODAL ======= */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Generate Schedule</h2>
                            <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {generateResult ? (
                                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                    <h4 className="font-bold mb-1">Success!</h4>
                                    <p className="text-sm">{generateResult.message}</p>
                                    <p className="text-xs mt-2 opacity-80">Generated {generateResult.count} schedule slots.</p>
                                    <button onClick={() => setIsGenerateModalOpen(false)} className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Close</button>
                                </div>
                            ) : (
                                <>
                                    {generateError && (
                                        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                            <p className="text-sm">{generateError}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Department</label>
                                        <select 
                                            value={generateConfig.departmentId}
                                            onChange={(e) => setGenerateConfig({...generateConfig, departmentId: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {departments.map(d => (
                                                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                                            ))}
                                            {departments.length === 0 && <option value="" disabled>No departments — create one in Settings</option>}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Batch Info (e.g., "Year 2 - CS")</label>
                                        <input 
                                            type="text"
                                            placeholder="Leave blank for auto-generated"
                                            value={generateConfig.batchInfo}
                                            onChange={(e) => setGenerateConfig({...generateConfig, batchInfo: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Classes Per Day</label>
                                        <input 
                                            type="number" 
                                            min="1" max="8"
                                            value={generateConfig.maxClassesPerDay}
                                            onChange={(e) => setGenerateConfig({...generateConfig, maxClassesPerDay: parseInt(e.target.value)})}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Available Rooms</label>
                                        <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
                                            {roomsList.map(r => (
                                                <label key={r._id} className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={generateConfig.availableRooms.includes(r._id)}
                                                        onChange={(e) => {
                                                            const newRooms = e.target.checked 
                                                                ? [...generateConfig.availableRooms, r._id]
                                                                : generateConfig.availableRooms.filter(id => id !== r._id);
                                                            setGenerateConfig({...generateConfig, availableRooms: newRooms});
                                                        }}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Room {r.number} ({r.type}, Cap: {r.capacity})</span>
                                                </label>
                                            ))}
                                            {roomsList.length === 0 && <span className="text-sm text-slate-500">No rooms found. Add rooms first.</span>}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !generateConfig.departmentId || generateConfig.availableRooms.length === 0}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-6"
                                    >
                                        {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Generate Timetable'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ======= MANUAL ASSIGN MODAL ======= */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Assign Class</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {DAYS[assignSlot.dayOfWeek]}, {assignSlot.startTime} - {assignSlot.endTime}
                                </p>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Course *</label>
                                <select 
                                    value={assignForm.course}
                                    onChange={(e) => setAssignForm({...assignForm, course: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Course</option>
                                    {coursesList.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                                    ))}
                                </select>
                                {coursesList.length === 0 && <p className="text-xs text-amber-600 mt-1">No courses found. Create courses first.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Faculty (Optional)</label>
                                <select 
                                    value={assignForm.faculty}
                                    onChange={(e) => setAssignForm({...assignForm, faculty: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">No Faculty (TBA)</option>
                                    {facultyList.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room *</label>
                                <select 
                                    value={assignForm.room}
                                    onChange={(e) => setAssignForm({...assignForm, room: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Room</option>
                                    {assignRooms.map(r => (
                                        <option key={r._id} value={r._id}>Room {r.number} ({r.type}, Cap: {r.capacity})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot *</label>
                                <select 
                                    value={assignForm.timeSlot}
                                    onChange={(e) => setAssignForm({...assignForm, timeSlot: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Time Slot</option>
                                    {timeSlotsList.map(ts => (
                                        <option key={ts._id} value={ts._id}>
                                            {DAYS[ts.dayOfWeek]} {ts.startTime} - {ts.endTime}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Info *</label>
                                <input 
                                    type="text"
                                    placeholder="e.g., Year 2 - CS, Batch A"
                                    value={assignForm.batchInfo}
                                    onChange={(e) => setAssignForm({...assignForm, batchInfo: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <button 
                                onClick={handleAssign}
                                disabled={isAssigning || !assignForm.course || !assignForm.room || !assignForm.timeSlot}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4"
                            >
                                {isAssigning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Assign to Timetable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======= SCHEDULE DETAIL / DELETE MODAL ======= */}
            {selectedSchedule && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Schedule Details</h2>
                            <button onClick={() => setSelectedSchedule(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Course</p>
                                        <p className="font-bold text-slate-900">{selectedSchedule.course?.name || 'N/A'}</p>
                                        <p className="text-sm text-indigo-600 font-semibold">{selectedSchedule.course?.code || ''}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Time</p>
                                        <p className="font-semibold text-slate-900">
                                            {selectedSchedule.timeSlot ? `${DAYS[selectedSchedule.timeSlot.dayOfWeek]}, ${selectedSchedule.timeSlot.startTime} - ${selectedSchedule.timeSlot.endTime}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Room</p>
                                        <p className="font-semibold text-slate-900">Room {selectedSchedule.room?.number || 'TBA'}</p>
                                        <p className="text-xs text-slate-500">{selectedSchedule.room?.type} — Capacity: {selectedSchedule.room?.capacity}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <UserIcon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Faculty</p>
                                        <p className="font-semibold text-slate-900">{selectedSchedule.faculty?.name || 'Not Assigned (TBA)'}</p>
                                        {selectedSchedule.faculty?.email && <p className="text-xs text-slate-500">{selectedSchedule.faculty.email}</p>}
                                    </div>
                                </div>

                                {selectedSchedule.batchInfo && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-xs text-slate-500 font-medium">Batch</p>
                                        <p className="font-semibold text-slate-700">{selectedSchedule.batchInfo}</p>
                                    </div>
                                )}
                            </div>

                            {user?.role === 'ADMIN' && (
                                <button 
                                    onClick={() => handleDelete(selectedSchedule._id)}
                                    disabled={isDeleting}
                                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-100 disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
                                >
                                    {isDeleting ? (
                                        <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                    ) : (
                                        <><Trash2 className="w-4 h-4" /> Remove from Timetable</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
