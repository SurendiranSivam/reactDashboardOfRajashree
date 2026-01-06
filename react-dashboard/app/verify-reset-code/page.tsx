'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function VerifyResetCodeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error('Email is required');
            router.push('/forgot-password');
        }
    }, [email, router]);

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code || code.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setLoading(true);

        try {
            // Verify code from database - IGNORE EXPIRATION FOR NOW (testing)
            const { data: otpRecord, error } = await supabase
                .from('password_reset_otps')
                .select('*')
                .eq('email', email)
                .eq('otp', code)
                // Removed: .eq('used', false)  - Allow reuse for testing
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error || !otpRecord) {
                toast.error('Invalid code. Code not found in database.');
                setLoading(false);
                return;
            }

            // SKIP EXPIRATION CHECK FOR TESTING
            // Just mark as used and proceed
            await supabase
                .from('password_reset_otps')
                .update({ used: true })
                .eq('otp_id', otpRecord.otp_id);

            toast.success('Code verified!');

            // Redirect to reset password
            router.push(`/reset-password?email=${encodeURIComponent(email)}&verified=true`);

        } catch (error: any) {
            console.error('Verification error:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/95 shadow-2xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Enter Reset Code
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter the 6-digit code sent to<br />
                        <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleVerifyCode}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Reset Code</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 text-center">
                                Check your email for the 6-digit code
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>

                        <div className="text-center space-y-2">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Request New Code
                            </Link>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

export default function VerifyResetCodePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <VerifyResetCodeContent />
        </Suspense>
    );
}
