import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Check, X, Loader, ArrowRight, Mail, User, Globe } from 'lucide-react';
import axios from 'axios';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subdomain: '',
        company_name: '',
        admin_name: '',
        admin_email: ''
    });
    const [subdomainStatus, setSubdomainStatus] = useState(null); // 'checking', 'available', 'taken'
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const API_BASE = 'http://localhost:8000';

    // Debounce timer for subdomain check
    const [checkTimer, setCheckTimer] = useState(null);

    const checkSubdomain = async (subdomain) => {
        if (!subdomain || subdomain.length < 3) {
            setSubdomainStatus(null);
            return;
        }

        setSubdomainStatus('checking');

        try {
            const response = await axios.get(`${API_BASE}/api/check-subdomain/`, {
                params: { subdomain }
            });

            setSubdomainStatus(response.data.available ? 'available' : 'taken');
        } catch (error) {
            console.error('Error checking subdomain:', error);
            setSubdomainStatus(null);
        }
    };

    const handleSubdomainChange = (e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, subdomain: value });

        // Clear previous timer
        if (checkTimer) clearTimeout(checkTimer);

        // Set new timer to check after user stops typing
        const timer = setTimeout(() => checkSubdomain(value), 500);
        setCheckTimer(timer);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            console.log('Submitting signup data:', formData);
            const response = await axios.post(`${API_BASE}/api/signup/`, formData);
            console.log('Signup response:', response.data);

            if (response.data.success) {
                setSuccessData(response.data.data);

                // Redirect to new workspace after 3 seconds
                setTimeout(() => {
                    window.location.href = response.data.data.workspace_url;
                }, 3000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            console.error('Error response:', error.response);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else if (error.response?.data?.error) {
                setErrors({ general: error.response.data.error });
            } else if (error.message) {
                setErrors({ general: `Network error: ${error.message}` });
            } else {
                setErrors({ general: 'An unknown error occurred. Check console for details.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[100px] -z-10"></div>

                <div className="card max-w-md w-full text-center animate-fade-in border-green-500/30">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-6 mx-auto animate-float">
                        <Check className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Workspace Ready! 🚀
                    </h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        <span className="text-white font-semibold">{successData.company_name}</span> has been successfully deployed.
                    </p>

                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-8 text-left relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-sm text-gray-500 mb-2">Your Workspace URL</div>
                        <div className="text-blue-400 font-mono text-lg break-all flex items-center gap-2">
                            <Globe size={16} />
                            {successData.workspace_url}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader className="w-4 h-4 animate-spin" />
                        Redirecting you in 3 seconds...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid -z-10"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10"></div>

            <div className="card max-w-lg w-full animate-fade-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-6 shadow-lg shadow-primary/20">
                        <Building2 className="w-7 h-7" />
                    </Link>
                    <h2 className="text-3xl font-bold mb-2">Create Workspace</h2>
                    <p className="text-gray-400">Launch your isolated project environment</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Subdomain */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                            Workspace URL
                        </label>
                        <div className="relative group">
                            <div className="flex items-center">
                                <div className="absolute left-3 text-gray-500 group-focus-within:text-primary transition-colors">
                                    <Globe size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="subdomain"
                                    value={formData.subdomain}
                                    onChange={handleSubdomainChange}
                                    placeholder="acme"
                                    className="input pl-10 rounded-r-none border-r-0"
                                    required
                                    minLength={3}
                                />
                                <span className="bg-gray-800/50 border border-gray-700 rounded-r-md px-4 py-3 text-gray-400 font-medium whitespace-nowrap">
                                    .projecthub.com
                                </span>
                            </div>

                            {/* Status Indicator */}
                            {formData.subdomain.length >= 3 && (
                                <div className="absolute right-[160px] top-1/2 -translate-y-1/2">
                                    {subdomainStatus === 'checking' && <Loader className="w-4 h-4 text-primary animate-spin" />}
                                    {subdomainStatus === 'available' && <Check className="w-4 h-4 text-green-400" />}
                                    {subdomainStatus === 'taken' && <X className="w-4 h-4 text-red-400" />}
                                </div>
                            )}
                        </div>

                        <div className="h-5 mt-1 ml-1">
                            {subdomainStatus === 'available' && <p className="text-xs text-green-400">✓ Domain available</p>}
                            {subdomainStatus === 'taken' && <p className="text-xs text-red-400">✗ Domain already taken</p>}
                            {errors.subdomain && <p className="text-xs text-red-400">{errors.subdomain[0]}</p>}
                        </div>
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                            Company Name
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                <Building2 size={18} />
                            </div>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="Acme Inc."
                                className="input pl-10"
                                required
                            />
                        </div>
                        {errors.company_name && <p className="text-xs text-red-400 mt-1 ml-1">{errors.company_name[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Admin Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="admin_name"
                                    value={formData.admin_name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="input pl-10"
                                    required
                                />
                            </div>
                            {errors.admin_name && <p className="text-xs text-red-400 mt-1 ml-1">{errors.admin_name[0]}</p>}
                        </div>

                        {/* Admin Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="admin_email"
                                    value={formData.admin_email}
                                    onChange={handleChange}
                                    placeholder="john@acme.com"
                                    className="input pl-10"
                                    required
                                />
                            </div>
                            {errors.admin_email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.admin_email[0]}</p>}
                        </div>
                    </div>

                    {/* Error Message */}
                    {errors.general && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
                            <X size={16} />
                            {errors.general}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || subdomainStatus === 'taken' || subdomainStatus === 'checking'}
                        className="btn btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                Deploying Workspace...
                            </>
                        ) : (
                            <>
                                Create Workspace <ArrowRight className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have a workspace? <Link to="/login" className="text-primary hover:text-primary-hover font-medium hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
