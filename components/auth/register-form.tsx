'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import Link from 'next/link';

function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [serverEmail, setServerEmail] = useState('');
  const [resendTimeout, setResendTimeout] = useState(0);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle resend timeout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendTimeout > 0) {
      timer = setInterval(() => {
        setResendTimeout((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimeout]);

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

  // Handle form submission with password and username validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError('Username can only contain letters and numbers');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, fullName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setServerEmail(email);
        setIsModalOpen(true);
        setResendTimeout(20);
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  // Handle verification code submission
  const handleVerifyCode = async (code: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: serverEmail, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid code');
      } else {
        setIsModalOpen(false);
        alert('Email verified successfully! You can now login.');
        window.location.href = '/login';
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (loading || resendTimeout > 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: serverEmail,
          username,
          fullName,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend verification code');
      } else {
        setResendTimeout(20);
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  // Handle OTP input change and auto-verify on 6 digits
  const handleCodeChange = (value: string) => {
    setVerificationCode(value);
    if (value.length === 6 && !loading) {
      handleVerifyCode(value);
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  // Define variants for modal animation
  const modalVariants: Variants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 50,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Define variants for backdrop animation
  const backdropVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Letters and numbers only"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={20}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-destructive text-center text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span
                    className="loading loading-bars loading-md text-primary"
                    aria-label="Loading"
                  ></span>
                ) : (
                  'Register'
                )}
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              Already have an account?
              <Link href="/login" className="underline underline-offset-4 ml-1">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm bg-opacity-50 z-50"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-primary-foreground p-6 rounded-md max-w-sm w-full shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-center">
                Email Verification
              </h3>
              <p className="mb-4 text-center text-primary">
                Please enter the verification code sent to{' '}
                <strong>{serverEmail}</strong>
              </p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={handleCodeChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-destructive text-center text-sm my-4">
                  {error}
                </p>
              )}

              <div className="flex justify-between mt-6 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={loading || resendTimeout > 0}
                >
                  {resendTimeout > 0 ? `Resend (${resendTimeout}s)` : 'Resend'}
                </Button>
                <Button
                  onClick={() => handleVerifyCode(verificationCode)}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      className="loading loading-bars loading-md text-primary"
                      aria-label="Loading"
                    ></span>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RegisterForm;
