import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Waves } from 'lucide-react';
import OceanBackground from '../components/OceanBackground';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', loginId: '', password: '', role: 'STUDENT'
    });
    const { register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch {
            // Error handled by store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
            <OceanBackground />

            <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl float-slow glow-animation slide-up mx-4">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 shadow-lg shadow-ocean-500/30 mb-4">
                        <Waves className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                    <p className="text-ocean-200/60 text-sm">Join the Smart Classroom ocean</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 text-sm text-red-200 bg-red-500/15 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-1.5">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-ocean-400/60" />
                            </div>
                            <input type="text" name="name" value={formData.name} onChange={handleChange}
                                className="input-ocean" placeholder="John Doe" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-1.5">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-ocean-400/60" />
                            </div>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="input-ocean" placeholder="you@university.edu" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-1.5">Login ID</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-ocean-400/60" />
                            </div>
                            <input type="text" name="loginId" value={formData.loginId} onChange={handleChange}
                                className="input-ocean" placeholder="AD+5, F+4, or SD+10 digits" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-ocean-400/60" />
                            </div>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                className="input-ocean" placeholder="••••••••" required minLength={6} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-1.5">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}
                            className="select-ocean">
                            <option value="STUDENT">Student</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="btn-ocean w-full flex justify-center items-center py-3.5 text-sm mt-2">
                        {isLoading ? (
                            <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
                        ) : (
                            <span className="flex items-center gap-2">
                                Create Account
                                <UserPlus className="h-4 w-4" />
                            </span>
                        )}
                    </button>

                    <p className="text-center text-sm text-ocean-200/50 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-ocean-400 hover:text-ocean-300 transition-colors">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
