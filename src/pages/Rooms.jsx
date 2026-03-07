import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Plus, Trash2, X, Wifi, Monitor, Wind } from 'lucide-react';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ number: '', capacity: 30, type: 'LECTURE', features: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const featureOptions = ['Projector', 'Whiteboard', 'AC', 'Computer Lab', 'Smart Board', 'Wi-Fi'];

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try { setIsLoading(true); const { data } = await api.get('/rooms'); setRooms(data); }
        catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            await api.post('/rooms', formData);
            setIsModalOpen(false); setFormData({ number: '', capacity: 30, type: 'LECTURE', features: [] });
            fetchRooms();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this room?')) return;
        try { await api.delete(`/rooms/${id}`); setRooms(rooms.filter(r => r._id !== id)); }
        catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    const toggleFeature = (f) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
        }));
    };

    const getFeatureIcon = (f) => {
        if (f.includes('Wi-Fi') || f.includes('Smart')) return <Wifi className="w-3 h-3" />;
        if (f.includes('Projector') || f.includes('Monitor') || f.includes('Computer')) return <Monitor className="w-3 h-3" />;
        if (f.includes('AC')) return <Wind className="w-3 h-3" />;
        return null;
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><MapPin className="text-ocean-400" /> Manage Rooms</h1>
                    <p className="text-ocean-200/50 text-sm mt-1">Add, view, or remove classrooms and labs.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-ocean px-4 py-2.5 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Room
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="ocean-spinner"></div></div>
            ) : rooms.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center text-ocean-200/40">
                    <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No rooms found. Add a room to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map(room => (
                        <div key={room._id} className="glass-card rounded-2xl p-5 group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Room {room.number}</h3>
                                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-ocean-500/10 text-ocean-300 border border-ocean-500/15 mt-1 inline-block">{room.type}</span>
                                </div>
                                <button onClick={() => handleDelete(room._id)} className="p-2 text-ocean-300/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-ocean-200/50 text-sm mb-3">Capacity: <span className="text-ocean-200 font-semibold">{room.capacity}</span></p>
                            {room.features?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {room.features.map((f, i) => (
                                        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-ocean-500/8 text-ocean-300/60 border border-ocean-500/10">
                                            {getFeatureIcon(f)} {f}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="p-6 border-b border-ocean-500/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Add Room</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-ocean-300/50 hover:text-ocean-200"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Room Number</label>
                                <input type="text" required value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} className="input-ocean !pl-4" placeholder="e.g., 101" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Capacity</label>
                                <input type="number" min="1" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} className="input-ocean !pl-4" /></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-1.5">Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="select-ocean">
                                    <option value="LECTURE">Lecture</option><option value="LAB">Lab</option><option value="SEMINAR">Seminar</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-ocean-200/70 mb-2">Features</label>
                                <div className="flex flex-wrap gap-2">
                                    {featureOptions.map(f => (
                                        <button key={f} type="button" onClick={() => toggleFeature(f)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.features.includes(f)
                                                ? 'bg-ocean-500/20 text-ocean-300 border border-ocean-500/30'
                                                : 'bg-ocean-500/5 text-ocean-300/40 border border-ocean-500/10 hover:border-ocean-500/20'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div></div>
                            <button type="submit" disabled={isSubmitting} className="btn-ocean w-full py-3 text-sm flex justify-center mt-2">
                                {isSubmitting ? <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div> : 'Add Room'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
