import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Search, Plus, Edit, Trash2, Users, X } from 'lucide-react';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        number: '', capacity: 30, type: 'LECTURE', features: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get('/rooms');
            setRooms(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load rooms');
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;
        try {
            await api.delete(`/rooms/${id}`);
            setRooms(rooms.filter(r => r._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete room');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : []
            };
            await api.post('/rooms', payload);
            setIsModalOpen(false);
            setFormData({ number: '', capacity: 30, type: 'LECTURE', features: '' });
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create room');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'LECTURE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'LAB': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'SEMINAR': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const filteredRooms = rooms.filter(room =>
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="text-emerald-600" />
                        Manage Rooms
                    </h1>
                    <p className="text-slate-500 mt-1">Configure classrooms, labs, and their capacities.</p>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Room
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>No rooms found. {searchTerm ? 'Try a different search.' : 'Add a new room to get started.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-slate-50/50">
                        {filteredRooms.map(room => (
                            <div key={room._id || room.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Room {room.number}</h3>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getTypeColor(room.type)}`}>
                                                {room.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(room._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Users className="w-4 h-4" />
                                        <span>Capacity: <strong className="text-slate-900">{room.capacity}</strong> seats</span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Features</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(room.features && room.features.length > 0) ? (
                                                room.features.map((f, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                                        {f}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">No features listed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Room Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Add New Room</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                                <input type="text" required value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 101, A-201" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                <input type="number" min="10" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                    <option value="LECTURE">Lecture</option>
                                    <option value="LAB">Lab</option>
                                    <option value="SEMINAR">Seminar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Features (comma-separated)</label>
                                <input type="text" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Projector, AC, Whiteboard" />
                            </div>
                            <button type="submit" disabled={isSubmitting}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4">
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create Room'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
