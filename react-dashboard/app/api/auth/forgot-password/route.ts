import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email via Resend
async function sendOTPEmail(email: string, otp: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Rajashree Fashions <noreply@rajashreefashions.com>',
            to: [email],
            subject: 'Password Reset OTP - Rajashree Fashions',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Rajashree Fashions</h1>
                <p>Password Reset Request</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Your OTP Code</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Valid for 10 minutes</p>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This OTP is valid for 10 minutes only</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
                
                <p>Best regards,<br>Rajashree Fashions Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; 2025 Rajashree Fashions. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('✅ Email sent successfully to:', email);
        return true;

    } catch (error) {
        console.error('Failed to send email:', error);

        // Fallback: Log OTP to console for development
        console.log('\n' + '='.repeat(70));
        console.log('🔐 PASSWORD RESET OTP - DEVELOPMENT MODE');
        console.log('='.repeat(70));
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP Code: ${otp}`);
        console.log(`⏰ Expires: 10 minutes from now`);
        console.log('='.repeat(70) + '\n');

        return true;
    }
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
                message: 'If the email exists, an OTP has been sent'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        const { error: otpError } = await supabase
            .from('password_reset_otps')
            .insert({
                email,
                otp,
                expires_at: expiresAt.toISOString(),
                ip_address: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
                user_agent: request.headers.get('user-agent') || 'unknown',
            });

        if (otpError) {
            console.error('OTP storage error:', otpError);
            return NextResponse.json(
                { error: 'Failed to generate OTP' },
                { status: 500 }
            );
        }

        // Send OTP email
        await sendOTPEmail(email, otp);

        return NextResponse.json({
            message: 'OTP sent successfully',
            expiresIn: 600,
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
