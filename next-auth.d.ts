// next-auth.d.ts
import { DefaultSession, Profile } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: number;
    email: string;
    fullName: string;
    username: string;
    avatar: string | null;
    role: string;
    isVerified: boolean;
    provider: string | null;
    providerId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: User & DefaultSession['user'];
  }

  interface Profile {
    // Google-specific fields
    picture?: string; // Changed from 'image' to 'picture' for Google
    // GitHub-specific fields
    avatar_url?: string;
    // Common fields
    name?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    email: string;
    fullName: string;
    username: string;
    avatar: string | null;
    role: string;
    isVerified: boolean;
    provider: string | null;
    providerId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
}
