import { useState } from 'react';
import { Mail, ArrowLeft, Send, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import OceanBackground from '../components/OceanBackground';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            setMessage(data.data || 'Email sent successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <OceanBackground />

            <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl float-slow glow-animation slide-up mx-4">
                <Link to="/login" className="inline-flex items-center text-sm text-ocean-400 hover:text-ocean-300 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 shadow-lg shadow-ocean-500/30 mb-4">
                        <Waves className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                    <p className="text-ocean-200/60 text-sm">Enter your email and we'll send you a reset link.</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 text-sm text-emerald-200 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-200 bg-red-500/15 border border-red-500/30 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-ocean-200/80 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-ocean-400/60" />
                            </div>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="input-ocean" placeholder="you@university.edu" required />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading || !email}
                        className="btn-ocean w-full flex justify-center items-center py-3.5 text-sm">
                        {isLoading ? (
                            <div className="ocean-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
                        ) : (
                            <span className="flex items-center gap-2">
                                Send Reset Link
                                <Send className="h-4 w-4" />
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
