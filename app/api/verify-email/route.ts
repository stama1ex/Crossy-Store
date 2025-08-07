import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Находим код верификации
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'REGISTRATION',
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Проверяем, что email и username не заняты в User
    const orConditions: Prisma.UserWhereInput[] = [{ email }];
    if (verificationCode.username) {
      orConditions.push({ username: verificationCode.username });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingUser) {
      // Удаляем код, чтобы освободить email и username
      await prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      });
      return NextResponse.json(
        { error: 'Email or username already taken' },
        { status: 409 }
      );
    }

    // Дополнительная проверка, что все обязательные поля присутствуют
    if (
      !verificationCode.username ||
      !verificationCode.fullName ||
      !verificationCode.password
    ) {
      await prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      });
      return NextResponse.json(
        { error: 'Incomplete registration data' },
        { status: 400 }
      );
    }

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: verificationCode.email,
        username: verificationCode.username,
        fullName: verificationCode.fullName,
        password: verificationCode.password,
        role: 'USER',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Удаляем использованный код
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });

    return NextResponse.json({ message: 'Email successfully verified' });
  } catch (error) {
    console.error('❌ Verify email API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
