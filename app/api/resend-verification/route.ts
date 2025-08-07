import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/prisma/prisma-client';
import { hashPassword, sendVerificationEmail } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, username, fullName, password } = await request.json();

    // Validate input
    if (!email || !username || !fullName || !password) {
      return NextResponse.json(
        { error: 'Email, username, fullName, and password are required' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return NextResponse.json(
          { error: 'User with this email is already registered' },
          { status: 400 }
        );
      }
    } catch (dbUserError) {
      console.error('❌ Database error checking existing user:', dbUserError);
      throw new Error('Failed to check existing user');
    }

    // Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      console.error('❌ Password hashing error:', hashError);
      throw new Error('Failed to hash password');
    }

    // Generate new verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    // Update or create verification code
    try {
      await prisma.verificationCode.upsert({
        where: { email_type: { email, type: 'REGISTRATION' } },
        update: {
          code: verificationCode,
          expiresAt,
          createdAt: new Date(),
          username,
          fullName,
          password: hashedPassword,
        },
        create: {
          email,
          code: verificationCode,
          type: 'REGISTRATION',
          expiresAt,
          createdAt: new Date(),
          username,
          fullName,
          password: hashedPassword,
        },
      });
    } catch (dbUpsertError) {
      console.error(
        '❌ Database error upserting verification code:',
        dbUpsertError
      );
      throw new Error('Failed to create or update verification code');
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      throw new Error('Failed to send verification email');
    }

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('❌ Resend verification API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
