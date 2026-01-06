import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('user_id, email')
            .eq('email', email)
            .single();

        if (userError || !user) {
            // For security, don't reveal if email exists
            return NextResponse.json({
                message: 'If the email exists, a reset code will be sent',
                showCode: false,
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes for easier testing

        // FIRST: Delete any old OTPs for this email (cleanup)
        await supabase
            .from('password_reset_otps')
            .delete()
            .eq('email', email);

        // THEN: Store new OTP in database
        const { error: otpError } = await supabase
            .from('password_reset_otps')
            .insert({
                email,
                otp,
                expires_at: expiresAt.toISOString(),
                used: false,
                ip_address: request.headers.get('x-forwarded-for') || 'unknown',
                user_agent: request.headers.get('user-agent') || 'unknown',
            });

        if (otpError) {
            console.error('OTP storage error:', otpError);
            return NextResponse.json(
                { error: 'Failed to generate OTP' },
                { status: 500 }
            );
        }

        // Log OTP for development (since email might not be configured)
        console.log('\n' + '='.repeat(70));
        console.log('🔐 PASSWORD RESET CODE');
        console.log('='.repeat(70));
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 Code: ${otp}`);
        console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`);
        console.log('='.repeat(70) + '\n');

        // Return code to display on screen (development mode)
        // In production, send via email and don't return code
        return NextResponse.json({
            message: 'Reset code generated',
            code: otp, // Show code on screen for development
            expiresAt: expiresAt.toISOString(),
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
