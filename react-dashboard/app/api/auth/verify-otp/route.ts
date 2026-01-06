import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        // Find OTP in database
        const { data: otpRecord, error: otpError } = await supabase
            .from('password_reset_otps')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .eq('used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (otpError || !otpRecord) {
            return NextResponse.json(
                { error: 'Invalid OTP' },
                { status: 400 }
            );
        }

        // Check if OTP is expired
        const expiresAt = new Date(otpRecord.expires_at);
        if (expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Mark OTP as used
        await supabase
            .from('password_reset_otps')
            .update({ used: true })
            .eq('otp_id', otpRecord.otp_id);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Store reset token in OTP record for verification
        await supabase
            .from('password_reset_otps')
            .update({
                ip_address: resetToken // Reuse this field to store token
            })
            .eq('otp_id', otpRecord.otp_id);

        return NextResponse.json({
            message: 'OTP verified successfully',
            token: resetToken,
        });

    } catch (error: any) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
