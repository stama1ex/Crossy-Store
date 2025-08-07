import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Find the verification code record
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'REGISTRATION',
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: verification.email },
          { username: verification.username }, // Safe: username is non-null
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: verification.email,
        username: verification.username, // Safe: username is String
        fullName: verification.fullName, // Safe: fullName is String
        password: verification.password, // Safe: password is String
        avatar: null,
        isVerified: true,
        role: 'USER',
        provider: 'credentials',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Delete the verification code after successful user creation
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error('❌ Verify API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
