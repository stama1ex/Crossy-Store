'use client';

import { LoginForm } from '@/components/auth/login-form';
import { Session } from 'next-auth';

interface Props {
  session: Session | null;
}

const LoginClient: React.FC<Props> = ({ session }) => {
  return <LoginForm />;
};

export default LoginClient;
