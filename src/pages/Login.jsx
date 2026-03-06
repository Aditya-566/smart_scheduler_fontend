import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, User } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 relative overflow-hidden">
            {/* Dynamic visual elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                    <p className="text-blue-100/80">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 text-sm text-red-100 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-100 mb-2">Login ID</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-blue-300" />
                            </div>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-xl bg-white/5 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                placeholder="e.g. AD12345, F1234, SD1234567890"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-blue-300" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-xl bg-white/5 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-blue-100 cursor-pointer">
                            <input type="checkbox" className="rounded border-blue-300/30 bg-white/5 text-blue-500 focus:ring-blue-400 mr-2" />
                            Remember me
                        </label>
                        <Link to="/forgotpassword" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-slate-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="flex items-center">
                                Sign In
                                <LogIn className="ml-2 h-5 w-5" />
                            </span>
                        )}
                    </button>



                    <p className="text-center text-sm text-blue-100/70 mt-4">
                        Don't have an account? <Link to="/register" className="font-medium text-blue-300 hover:text-white transition-colors">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
