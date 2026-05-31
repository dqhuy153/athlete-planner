'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth }  from '@/lib/auth-context';

export function AdminLoginPage() {
  const { login } = useAuth();
  const { push }  = useToast();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      push({ title: 'Missing credentials', description: 'Email and password are required.', tone: 'error' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid credentials.';
      push({ title: 'Login failed', description: message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield size={24} className="text-primary" aria-hidden />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-on-surface">Admin Portal</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">Root access only</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-medium text-on-surface">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-sm font-medium text-on-surface">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-on-surface-variant">
          Secure admin portal — unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
