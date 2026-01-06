'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetCode, setResetCode] = useState('');

    const handleSendResetCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/send-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset code');
            }

            if (data.code) {
                // Code generated - show it
                setResetCode(data.code);
                toast.success('Reset code generated!');
            }

        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (resetCode) {
            router.push(`/verify-reset-code?email=${encodeURIComponent(email)}`);
        }
    };

    if (resetCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/95 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Reset Code Generated
                        </CardTitle>
                        <CardDescription className="text-center">
                            Copy this code to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-6">
                            <p className="text-sm text-gray-600 text-center mb-2">Your Reset Code</p>
                            <p className="text-4xl font-bold text-center text-indigo-600 tracking-widest font-mono select-all">
                                {resetCode}
                            </p>
                            <p className="text-xs text-gray-500 text-center mt-2">Valid for 10 minutes</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>📋 Copy this code!</strong>
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                You'll need to enter it on the next page.
                            </p>
                        </div>

                        <Button
                            onClick={handleContinue}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            Continue to Reset Password
                        </Button>

                        <Link href="/login">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Forgot Password Card */}
            <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/95 shadow-2xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Forgot Password?
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to get a reset code
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSendResetCode}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@rajashreefashion.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Code...
                                </>
                            ) : (
                                'Get Reset Code'
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
