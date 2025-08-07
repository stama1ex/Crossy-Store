import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/prisma/prisma-client';
import { hashPassword, sendVerificationEmail } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('📥 Register body:', body);

    const { email, username, password, fullName } = body;

    // Validate input
    if (!email || !username || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, username, password, and full name are required' },
        { status: 400 }
      );
    }

    // Check for existing user in User table
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 409 }
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

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    // Update or create VerificationCode record
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
          username,
          fullName,
          password: hashedPassword,
          code: verificationCode,
          type: 'REGISTRATION',
          expiresAt,
          createdAt: new Date(),
        },
      });
    } catch (dbUpsertError) {
      console.error(
        '❌ Database error upserting VerificationCode:',
        dbUpsertError
      );
      throw new Error('Failed to create or update verification code');
    }

    console.log('📨 Verification code:', verificationCode);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      throw new Error('Failed to send verification email');
    }

    return NextResponse.json({
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('❌ Register API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
