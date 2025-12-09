import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowRight, Globe, Loader, AlertCircle } from 'lucide-react';

const Login = () => {
    const [subdomain, setSubdomain] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!subdomain) {
            setError('Please enter your workspace subdomain');
            return;
        }

        setIsSubmitting(true);

        // Simulate check (in real app, check if tenant exists)
        setTimeout(() => {
            // Redirect to tenant subdomain
            // In development: http://subdomain.localhost:5173
            // In production: https://subdomain.projecthub.com

            const protocol = window.location.protocol;
            const host = window.location.host; // e.g. localhost:5173

            // If we are on localhost, we need to handle ports
            let newUrl;
            if (host.includes('localhost') || host.includes('127.0.0.1')) {
                // Remove existing subdomain if any (though usually login is on main domain)
                const parts = host.split('.');
                const baseHost = parts.length > 1 && !parts[0].includes('localhost') ? parts.slice(1).join('.') : host;
                newUrl = `${protocol}//${subdomain}.${baseHost}`;
            } else {
                // Production logic
                const domain = 'projecthub.com'; // Replace with env var
                newUrl = `${protocol}//${subdomain}.${domain}`;
            }

            window.location.href = newUrl;
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>

            <div className="card max-w-md w-full animate-fade-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-6 shadow-lg shadow-primary/20">
                        <LogIn className="w-7 h-7" />
                    </Link>
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Enter your workspace URL to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                            Workspace URL
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                <Globe size={18} />
                            </div>
                            <input
                                type="text"
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="acme"
                                className="input pl-10 rounded-r-none border-r-0"
                                autoFocus
                            />
                            <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gray-800/50 border border-l-0 border-gray-700 rounded-r-md text-gray-400 font-medium">
                                .projecthub.com
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2 animate-fade-in">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                Locating Workspace...
                            </>
                        ) : (
                            <>
                                Continue to Workspace <ArrowRight className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    New to ProjectHub? <Link to="/signup" className="text-primary hover:text-primary-hover font-medium hover:underline">Create a workspace</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
