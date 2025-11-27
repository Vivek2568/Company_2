import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login({ email, password });
        setLoading(false);
        if (result.ok) {
            navigate('/posts');
        } else {
            const err = result.error || 'Login failed';
            toast.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Left: Blue themed hero with illustration and copy */}
                <div className="hidden md:flex w-1/2 bg-indigo-50 flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                    <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
                    <div className="absolute bottom-[-20px] right-[-20px] w-60 h-60 bg-blue-100 rounded-full opacity-50"></div>
                        <div className="relative z-10">
                            <img
                                src="https://cdn.jsdelivr.net/gh/undraw/undraw@master/static/undraw_fingerprint_swrc.svg"
                                alt="Login Illustration"
                                className="w-72 h-72 object-contain mb-6 drop-shadow-md mix-blend-multiply"
                            />
                            {/* left panel keeps theme/illustration but no heading or copy text per request */}
                        </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">Sign in to your account</h1>
                        <p className="text-slate-500 mt-2">Or <Link to="/signup" className="text-indigo-600 font-semibold">create a new account</Link></p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging In...
                                    </span>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account yet?{' '}
                            <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;