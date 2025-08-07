'use client';

import { useState, useTransition, useRef } from 'react';
import { UserCircle } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface UserProfileProps {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    username: string;
    avatar: string | null;
    isVerified: boolean;
    role: string;
    provider: string | null;
    providerId: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const [isPending, startTransition] = useTransition();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );
  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { update } = useSession();

  // Handle avatar upload
  const handleAvatarChange = (file: File) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarChange(file);
    }
  };

  // Handle drag-and-drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.relatedTarget &&
      !dropZoneRef.current?.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleAvatarChange(file);
    } else {
      setError('Please drop an image file');
    }
  };

  // Handle avatar submission
  const handleAvatarSubmit = async () => {
    if (!avatar) {
      setError('Please select an image to upload');
      return;
    }
    startTransition(async () => {
      setSuccess(null);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('avatar', avatar);
        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(
            error === 'Only JPEG, PNG, GIF, or WebP images are allowed'
              ? 'Please upload a valid image (JPEG, PNG, GIF, or WebP)'
              : error || 'Failed to update avatar'
          );
        }
        const { publicId } = await response.json();
        setAvatar(null);
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(publicId);
        setSuccess('Avatar updated successfully');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await refreshUserData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update avatar'
        );
        setSuccess(null);
      }
    });
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    startTransition(async () => {
      setSuccess(null);
      setError(null);
      try {
        const response = await fetch('/api/user/avatar/delete', {
          method: 'POST',
          cache: 'no-store',
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to delete avatar');
        }
        setAvatar(null);
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(null);
        setSuccess('Avatar deleted successfully');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await refreshUserData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete avatar'
        );
        setSuccess(null);
      }
    });
  };

  // Function to fetch updated user data
  const refreshUserData = async () => {
    console.log('Refreshing user data...');
    try {
      const response = await fetch('/api/user/me', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const updatedUser = await response.json();
      console.log('Updated user data:', updatedUser);
      setAvatarPreview(updatedUser.avatar || null);
      setFullName(updatedUser.fullName || '');
      setUsername(updatedUser.username);

      // Update session with new user data
      await update({
        ...updatedUser,
        id: updatedUser.id.toString(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to refresh user data'
      );
    }
  };

  // Handle username change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setUsername(value);
      setError(null);
    } else {
      setError('Username can only contain letters and numbers');
    }
  };

  const handleUsernameSubmit = async () => {
    if (username === user.username) return;
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError('Username can only contain letters and numbers');
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch('/api/user/username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, oldUsername: user.username }),
          cache: 'no-store',
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to update username');
        }
        const { newUsername } = await response.json();
        setSuccess('Username updated successfully');
        setError(null);
        await refreshUserData();
        router.replace(`/user/${newUsername}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update username'
        );
        setSuccess(null);
      }
    });
  };

  // Handle fullName change
  const handleFullNameSubmit = async () => {
    if (fullName === user.fullName) return;
    if (fullName && fullName.length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch('/api/user/fullname', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: fullName || null }),
          cache: 'no-store',
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to update full name');
        }
        setSuccess('Full name updated successfully');
        setError(null);
        await refreshUserData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update full name'
        );
        setSuccess(null);
      }
    });
  };

  // Handle password change
  const canChangePassword =
    user.provider === null || user.provider === 'credentials';
  const handlePasswordSubmit = async () => {
    if (!oldPassword || !newPassword) {
      setError('Both old and new passwords are required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch('/api/user/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword, newPassword }),
          cache: 'no-store',
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to update password');
        }
        setSuccess('Password updated successfully');
        setError(null);
        setOldPassword('');
        setNewPassword('');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update password'
        );
        setSuccess(null);
      }
    });
  };

  return (
    <main className="max-w-xl mx-auto px-6 py-12 bg-background min-h-screen">
      <div className="card rounded-lg shadow-md p-8 space-y-8 animate-fade-in border break-all">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            ref={dropZoneRef}
            className={`relative group flex justify-center items-center rounded-full w-30 h-30 border-4 ${
              isDragging ? 'border-dashed border-primary' : 'border-muted'
            } animate-scale-in`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {avatarPreview ? (
              avatarPreview.startsWith('blob:') ? (
                <Image
                  src={avatarPreview}
                  alt="User avatar preview"
                  width={120}
                  height={120}
                  className="rounded-full object-cover w-30 h-30 group-hover:scale-105 transition-transform duration-300"
                  onError={() => {
                    console.warn(
                      'Avatar preview failed to load, falling back to default icon.'
                    );
                    if (avatarPreview && avatarPreview.startsWith('blob:')) {
                      URL.revokeObjectURL(avatarPreview);
                    }
                    setAvatarPreview(null);
                  }}
                />
              ) : (
                <CldImage
                  src={avatarPreview}
                  alt="User avatar"
                  width={120}
                  height={120}
                  crop={{
                    type: 'auto',
                    source: true,
                  }}
                  className="rounded-full object-cover w-30 h-30 group-hover:scale-105 transition-transform duration-300"
                  onError={() => {
                    console.warn(
                      'CldImage failed to load, falling back to default icon.'
                    );
                    setAvatarPreview(null);
                  }}
                />
              )
            ) : (
              <UserCircle
                size={120}
                className="text-primary animate-spin-slow group-hover:text-primary transition-colors duration-300"
              />
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md opacity-50 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isPending}
                ref={fileInputRef}
              />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primary animate-slide-in-left">
              {fullName || username}
            </h1>
            <p className="text-sm text-primary">{user.email}</p>
            {user.isVerified && (
              <span className="text-xs text-green-500 mt-1 block animate-fade-in">
                Verified Account
              </span>
            )}
            <div className="mt-3 flex justify-center gap-2">
              {avatar && (
                <Button
                  onClick={handleAvatarSubmit}
                  disabled={isPending}
                  className="text-sm bg-primary-foreground hover:bg-primary-foreground/50 font-medium text-primary disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Avatar'}
                </Button>
              )}
              {avatarPreview && (
                <Button
                  onClick={handleAvatarDelete}
                  disabled={isPending}
                  className="px-4 py-2 text-primary-content rounded bg-destructive hover:bg-red-700 transition"
                >
                  {isPending ? 'Deleting...' : 'Delete Avatar'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-error text-sm animate-shake">
            <span className="text-primary">{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success text-sm animate-fade-in">
            <span className="text-primary">{success}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-primary animate-slide-in-up">
            Full Name
          </h2>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex-1 rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50 text-primary animate-fade-in"
              disabled={isPending}
              placeholder="Enter your full name"
              maxLength={20}
            />
            <Button
              onClick={handleFullNameSubmit}
              disabled={isPending || fullName === user.fullName}
              className="text-sm bg-primary-foreground font-medium text-primary disabled:opacity-50 animate-pulse-once hover:bg-primary-foreground/50"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-primary animate-slide-in-up">
            Username
          </h2>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="flex-1 rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50 text-primary animate-fade-in"
              disabled={isPending}
              maxLength={20}
              placeholder="Letters and numbers only"
            />
            <Button
              onClick={handleUsernameSubmit}
              disabled={isPending || username === user.username}
              className="text-sm bg-primary-foreground font-medium text-primary disabled:opacity-50 animate-pulse-once hover:bg-primary-foreground/50"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Password Change (Conditional) */}
        {canChangePassword && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-primary animate-slide-in-up">
              Change Password
            </h2>
            <div className="space-y-2">
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Old Password"
                className="w-full rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50 text-primary animate-fade-in"
                disabled={isPending}
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50 text-primary animate-fade-in"
                disabled={isPending}
              />
              <Button
                onClick={handlePasswordSubmit}
                disabled={isPending}
                className="w-full bg-primary-foreground hover:bg-primary-foreground/50 text-sm font-medium text-primary disabled:opacity-50 animate-pulse-once"
              >
                {isPending ? 'Saving...' : 'Change Password'}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
