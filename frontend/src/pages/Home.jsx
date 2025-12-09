import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Layers, Shield, Zap, Globe, Database } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-grid -z-10"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-20"></div>

            {/* Navbar */}
            <header className="container py-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Layers className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">ProjectHub</span>
                </div>
                <nav className="flex items-center gap-6">
                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors font-medium">
                        Log In
                    </Link>
                    <Link to="/signup" className="btn btn-primary">
                        Get Started
                    </Link>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container py-20 md:py-32 text-center relative z-10">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-300">v2.0 Now Available</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
                            Multi-Tenant SaaS <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Made Simple.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Deploy isolated workspaces for your clients in seconds.
                            Enterprise-grade security, infinite scalability, and zero headaches.
                        </p>

                        <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
                            <Link to="/signup" className="btn btn-primary text-lg px-8 py-4 w-full md:w-auto group">
                                Start Building Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="btn btn-secondary text-lg px-8 py-4 w-full md:w-auto">
                                View Documentation
                            </button>
                        </div>
                    </div>

                    {/* Floating Cards Animation */}
                    <div className="mt-20 relative h-64 hidden md:block animate-fade-in delay-300">
                        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-4xl h-full">
                            <div className="absolute top-0 left-0 animate-float delay-100">
                                <FeaturePill icon={<Database size={16} />} text="PostgreSQL Isolation" color="bg-blue-500" />
                            </div>
                            <div className="absolute top-10 right-20 animate-float delay-200">
                                <FeaturePill icon={<Globe size={16} />} text="Subdomain Routing" color="bg-purple-500" />
                            </div>
                            <div className="absolute bottom-10 left-20 animate-float delay-300">
                                <FeaturePill icon={<Shield size={16} />} text="Enterprise Security" color="bg-green-500" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Built for developers who want to ship faster without compromising on quality or security.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-blue-400" />}
                            title="Data Isolation"
                            description="Each tenant gets their own dedicated schema. Your data never touches another client's data, ensuring 100% privacy."
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-purple-400" />}
                            title="Smart Routing"
                            description="Automatic subdomain detection and routing. We handle the complex DNS logic so you don't have to."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-yellow-400" />}
                            title="Lightning Fast"
                            description="Powered by React 18 and Django 5. Optimized for speed with edge caching and efficient database queries."
                        />
                    </div>
                </section>
            </main>

            <footer className="container py-12 text-center text-gray-500 border-t border-gray-800">
                <div className="flex justify-center gap-8 mb-8">
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    <a href="#" className="hover:text-white transition-colors">Discord</a>
                </div>
                <p>© 2024 ProjectHub SaaS. Built with ❤️ for developers.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="card group hover:border-primary/50">
        <div className="mb-6 p-3 bg-white/5 rounded-xl w-fit group-hover:bg-primary/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const FeaturePill = ({ icon, text, color }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 shadow-xl backdrop-blur-md">
        <div className={`p-1 rounded-full ${color} bg-opacity-20`}>
            {icon}
        </div>
        <span className="text-sm font-medium text-gray-200">{text}</span>
    </div>
);

export default Home;
