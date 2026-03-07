import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, User, Waves } from 'lucide-react';
import OceanBackground from '../components/OceanBackground';

export default function Login() {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(loginId, password);
            navigate('/dashboard');
        } catch {
            // Error is handled in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <OceanBackground />

            {/* Floating decorative elements */}
            <div className="fixed top-20 left-20 w-2 h-2 rounded-full bg-ocean-400/30 float-animation" style={{ animationDelay: '0s' }}></div>
            <div className="fixed top-40 right-32 w-3 h-3 rounded-full bg-ocean-300/20 float-animation" style={{ animationDelay: '2s' }}></div>
            <div className="fixed bottom-32 left-40 w-1.5 h-1.5 rounded-full bg-ocean-500/25 float-animation" style={{ animationDelay: '4s' }}></div>

            {/* Main login card - floating */}
            <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl float-slow glow-animation slide-up mx-4">
                {/* Logo area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 shadow-lg shadow-ocean-500/30 mb-4">
                        <Waves className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-ocean-200/60 text-sm">
                        Dive into your Smart Classroom dashboard
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-4 text-sm text-red-200 bg-red-500/15 border border-red-500/30 rounded-xl backdrop-blur-sm slide-up">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="slide-up" style={{ animationDelay: '0.1s' }}>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-2">Login ID</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-4.5 w-4.5 text-ocean-400/60" />
                            </div>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className="input-ocean"
                                placeholder="e.g. AD12345, F1234, SD1234567890"
                                required
                            />
                        </div>
                    </div>

                    <div className="slide-up" style={{ animationDelay: '0.2s' }}>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4.5 w-4.5 text-ocean-400/60" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-ocean"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm slide-up" style={{ animationDelay: '0.3s' }}>
                        <label className="flex items-center text-ocean-200/60 cursor-pointer group">
                            <input type="checkbox" className="rounded border-ocean-400/30 bg-ocean-900/30 text-ocean-500 focus:ring-ocean-400 mr-2" />
                            <span className="group-hover:text-ocean-200 transition-colors">Remember me</span>
                        </label>
                        <Link to="/forgotpassword" className="font-medium text-ocean-400 hover:text-ocean-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-ocean w-full flex justify-center items-center py-3.5 text-sm slide-up"
                        style={{ animationDelay: '0.4s' }}
                    >
                        {isLoading ? (
                            <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In
                                <LogIn className="h-4 w-4" />
                            </span>
                        )}
                    </button>

                    <p className="text-center text-sm text-ocean-200/50 mt-6 slide-up" style={{ animationDelay: '0.5s' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-ocean-400 hover:text-ocean-300 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
