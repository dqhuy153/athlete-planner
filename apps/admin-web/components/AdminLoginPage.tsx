'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';

export function AdminLoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      push({
        title: 'Missing credentials',
        description: 'Email and password are required.',
        tone: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      push({
        title: 'Welcome!',
        description: `Logged in as ${email}`,
        tone: 'success',
      });
    } catch (error: any) {
      push({
        title: 'Login Failed',
        description: error?.message || 'Invalid email or password.',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Admin Portal</h1>
              <p className="text-xs text-on-surface-variant">Admin Dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-on-surface">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-on-surface">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin(e as any)}
                disabled={loading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-xs text-on-surface-variant text-center mt-6">
            Root access only • Secure admin portal
          </p>
        </div>
      </div>
    </div>
  );
}
