'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();

            if (data.user) {
                localStorage.setItem('dashboard_user', JSON.stringify(data.user));
                toast.success('Login successful!');
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden relative">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
            </div>

            {/* Left Side - Peacock Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 z-10" />

                {/* Peacock Background Image */}
                <div className="relative w-full h-full flex items-center justify-center p-12">
                    <div className="relative w-full h-full max-w-2xl">
                        <Image
                            src="/peacock-illustration.jpg"
                            alt="Peacock Branding"
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* Floating Orbs Animation */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-32 right-24 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-600 rounded-full blur-2xl opacity-20 animate-pulse delay-500" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="relative w-44 h-44 rounded-full bg-white shadow-2xl overflow-hidden ring-4 ring-purple-200">
                                <Image
                                    src="/logo-peacock.png"
                                    alt="Rajashree Fashion Logo"
                                    fill
                                    className="object-cover scale-90"
                                    priority
                                />
                                {/* Glow Effect */}
                                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-2xl -z-10 animate-pulse" />
                            </div>
                        </div>

                        {/* Welcome Text with Gradient */}
                        <div className="space-y-3 pt-4">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Sign in to your account
                                <Sparkles className="w-4 h-4 text-cyan-500" />
                            </p>
                        </div>
                    </div>

                    {/* Login Form Card */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-medium">
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                                <label htmlFor="remember" className="text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors">
                                    Remember me
                                </label>
                            </div>
                            <a
                                href="/forgot-password"
                                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button with Gradient */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In
                                    <Sparkles className="w-4 h-4" />
                                </span>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-500">
                                    Secure Admin Access
                                </span>
                            </div>
                        </div>

                        {/* Footer Text */}
                        <p className="text-center text-sm text-gray-500">
                            Powered by{' '}
                            <span className="font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                                foxindiatech
                            </span>
                        </p>
                    </form>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
    );
}
