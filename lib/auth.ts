import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from '@/prisma/prisma-client';
import { comparePasswords } from '@/lib/auth/auth-utils';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            username: true,
            avatar: true,
            password: true,
            role: true,
            isVerified: true,
            provider: true,
            providerId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await comparePasswords(
          credentials.password,
          user.password
        );
        if (!isValid) {
          return null;
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          provider: user.provider,
          providerId: user.providerId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = Number(user.id);
        token.email = user.email;
        token.fullName = user.fullName;
        token.username = user.username;
        token.avatar = user.avatar;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.provider = user.provider;
        token.providerId = user.providerId;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }

      if (account?.provider === 'google' || account?.provider === 'github') {
        console.log('Profile data:', profile);

        let avatar: string | null = null;
        if (account.provider === 'google' && profile?.picture) {
          avatar = profile.picture;
        } else if (account.provider === 'github' && profile?.avatar_url) {
          avatar = profile.avatar_url;
        }

        let dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            email: true,
            fullName: true,
            username: true,
            avatar: true,
            role: true,
            isVerified: true,
            provider: true,
            providerId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: token.email!,
              fullName: profile?.name || token.name || 'Unknown',
              username: `user_${Math.random().toString(36).slice(2, 9)}`,
              avatar: avatar,
              provider: account.provider,
              providerId: account.providerAccountId,
              isVerified: true,
              role: 'USER',
              password: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        } else if (!dbUser.provider || !dbUser.avatar) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              provider: account.provider,
              providerId: account.providerAccountId,
              isVerified: true,
              avatar: dbUser.avatar ?? avatar,
              fullName: dbUser.fullName ?? profile?.name ?? token.name,
            },
            select: {
              id: true,
              email: true,
              fullName: true,
              username: true,
              avatar: true,
              role: true,
              isVerified: true,
              provider: true,
              providerId: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        }

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.fullName = dbUser.fullName;
        token.username = dbUser.username;
        token.avatar = dbUser.avatar;
        token.role = dbUser.role;
        token.isVerified = dbUser.isVerified;
        token.provider = dbUser.provider;
        token.providerId = dbUser.providerId;
        token.createdAt = dbUser.createdAt;
        token.updatedAt = dbUser.updatedAt;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        fullName: token.fullName,
        username: token.username,
        avatar: token.avatar,
        role: token.role,
        isVerified: token.isVerified,
        provider: token.provider,
        providerId: token.providerId,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
      };
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
