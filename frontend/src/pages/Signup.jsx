import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const PasswordRule = ({ label, ok }) => (
    <div className={`flex items-center gap-2 ${ok ? 'text-green-600' : 'text-slate-500'}`}>
        <svg className={`w-4 h-4 ${ok ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 16 16" fill="none">
            {ok ? (
                <path fill="currentColor" d="M6.173 11.414 2.76 8.001l1.06-1.06L6.173 9.293l6.008-6.008 1.06 1.06z" />
            ) : (
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1" />
            )}
        </svg>
        <span className="text-xs">{label}</span>
    </div>
);

const Signup = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [loading, setLoading] = useState(false);

    const passwordRuleCheck = (pw) => {
        return {
            length: pw.length >= 8,
            uppercase: /[A-Z]/.test(pw),
            lowercase: /[a-z]/.test(pw),
            number: /[0-9]/.test(pw),
            special: /[!@#$%^&*(),.?":{}|<>\/;_+=~-]/.test(pw),
        };
    };

    const validatePasswordBeforeSubmit = (pw, confirm) => {
        const checks = passwordRuleCheck(pw);
        const allOk = Object.values(checks).every(Boolean);
        setPasswordChecks(checks);
        if (!allOk) {
            toast.error('Password does not meet complexity requirements');
            return false;
        }
        if (pw !== confirm) {
            setPasswordError('Passwords do not match');
            toast.error('Passwords do not match');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // run validation
        if (!validatePasswordBeforeSubmit(password, confirmPassword)) return;
        setLoading(true);
        try {
            // include confirmPassword so backend can validate too
            await axios.post('/api/users/register', { username, email, password, confirmPassword });
            toast.success('Signup successful — please login');
            navigate('/login');
        } catch (err) {
            const resp = err.response?.data;
            const msg = resp?.message || 'Signup failed';
            if (resp?.errors) {
                // show server-provided errors if present
                resp.errors.forEach(e => toast.error(e));
            }
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Left: Illustration + copy */}
                <div className="hidden md:flex w-1/2 bg-indigo-50 flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                    <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
                    <div className="absolute bottom-[-20px] right-[-20px] w-60 h-60 bg-blue-100 rounded-full opacity-50"></div>
                    <div className="relative z-10">
                        <img
                            src="https://cdn.jsdelivr.net/gh/undraw/undraw@master/static/undraw_creative_team_r90h.svg"
                            alt="Signup Illustration"
                            className="w-72 h-72 object-contain mb-6 drop-shadow-md mix-blend-multiply"
                        />
                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Join Blogify!</h2>
                        <p className="text-slate-600 text-lg">
                            Create your account and start sharing your vlogs with the world. <br />
                            <span className="text-indigo-600 font-semibold">It's free & easy.</span>
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
                        <p className="text-slate-500 mt-2">Get started with your free account today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <Input
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPassword(val);
                                    const checks = passwordRuleCheck(val);
                                    setPasswordChecks(checks);
                                    if (confirmPassword && val !== confirmPassword) {
                                        setPasswordError('Passwords do not match');
                                    } else {
                                        setPasswordError('');
                                    }
                                }}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                            <div className="mt-2 grid grid-cols-1 gap-1 text-sm">
                                <PasswordRule label="At least 8 characters" ok={passwordChecks.length} />
                                <PasswordRule label="One uppercase letter" ok={passwordChecks.uppercase} />
                                <PasswordRule label="One lowercase letter" ok={passwordChecks.lowercase} />
                                <PasswordRule label="One number" ok={passwordChecks.number} />
                                <PasswordRule label="One special character" ok={passwordChecks.special} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setConfirmPassword(val);
                                    if (password && val !== password) setPasswordError('Passwords do not match');
                                    else setPasswordError('');
                                }}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                            {passwordError && <p className="text-red-500 text-xs mt-1 pl-1">{passwordError}</p>}
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
                                        Signing up...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer transition-colors">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;