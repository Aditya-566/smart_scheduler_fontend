import { useState } from 'react';
import { Lock, CheckCircle, Waves } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import OceanBackground from '../components/OceanBackground';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
            localStorage.setItem('token', data.token);
            useAuthStore.setState({
                user: { _id: data._id, name: data.name, email: data.email, role: data.role },
                token: data.token, isAuthenticated: true, isLoading: false
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <OceanBackground />

            <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl float-slow glow-animation slide-up mx-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 shadow-lg shadow-ocean-500/30 mb-4">
                        <Waves className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-ocean-200/60 text-sm">Enter your new password below.</p>
                </div>

                {success ? (
                    <div className="text-center space-y-4 slide-up">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Password Reset!</h2>
                        <p className="text-ocean-200/60 text-sm">Redirecting to dashboard...</p>
                        <Link to="/dashboard" className="inline-block mt-4 text-ocean-400 hover:text-ocean-300 transition-colors text-sm">
                            Click here if not redirected
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 text-sm text-red-200 bg-red-500/15 border border-red-500/30 rounded-xl">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-ocean-200/80 mb-2">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-ocean-400/60" />
                                </div>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-ocean" placeholder="••••••••" required minLength={6} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ocean-200/80 mb-2">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-ocean-400/60" />
                                </div>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-ocean" placeholder="••••••••" required minLength={6} />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading || !password || !confirmPassword}
                            className="btn-ocean w-full flex justify-center items-center py-3.5 text-sm">
                            {isLoading ? (
                                <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
                            ) : "Reset Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
