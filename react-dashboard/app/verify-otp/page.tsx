'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error('Email is required');
            router.push('/forgot-password');
        }
    }, [email, router]);

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            toast.success('OTP verified!');

            // Redirect to reset password page
            router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${data.token}`);

        } catch (error: any) {
            toast.error(error.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResending(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to resend OTP');
            }

            toast.success('New OTP sent to your email');
            setOtp('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Verify OTP Card */}
            <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/95 shadow-2xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Verify OTP
                    </CardTitle>
                    <CardDescription className="text-center">
                        We've sent a 6-digit code to<br />
                        <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleVerifyOTP}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtp(value);
                                }}
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 text-center">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify OTP'
                            )}
                        </Button>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resending}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    {resending ? 'Resending...' : 'Resend OTP'}
                                </button>
                            </p>

                            <Link
                                href="/forgot-password"
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Change Email
                            </Link>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    );
}
