'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUsers, updateUserRole } from '@/lib/api';
import type { User } from '@athlete-planner/contracts';
import { UserRole, UserTier } from '@athlete-planner/contracts';
import { Input } from '@/components/ui/input';
import { Select } from '@athlete-planner/ui';
import { useToast } from '@/components/ui/toast';

export default function UsersPage() {
  const { session } = useAuth();
  const { push } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    if (!session) return;
    loadUsers();
  }, [session, page]);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await getUsers(session!.accessToken, { page, limit: LIMIT, search });
      setUsers(res.users);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    if (!session) return;
    try {
      await updateUserRole(session.accessToken, userId, role);
      loadUsers();
    } catch (e: any) {
      push({ title: e.message || 'Failed to update role', tone: 'error' });
    }
  }

  const filtered = search
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Users</h1>
        <span className="text-sm text-on-surface-variant">{total} total</span>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-on-surface-variant">Loading...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-outline">
            <table className="w-full text-sm">
              <thead className="bg-surface-variant">
                <tr>
                  <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Tier</th>
                  <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-variant/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-on-surface">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === UserRole.ADMIN || user.role === UserRole.ROOT
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface-variant text-on-surface-variant'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                     <td className="px-4 py-3">
                       <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                         user.tier === UserTier.PRO
                           ? 'bg-primary/10 text-primary'
                           : 'bg-surface-variant text-on-surface-variant'
                       }`}>
                         {user.tier}
                       </span>
                     </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="h-7 text-xs px-2 py-1"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="root">root</option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-on-surface-variant">
              Page {page} of {Math.ceil(total / LIMIT)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-outline rounded-lg text-on-surface disabled:opacity-40 hover:bg-surface-variant transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * LIMIT >= total}
                className="px-3 py-1.5 text-sm border border-outline rounded-lg text-on-surface disabled:opacity-40 hover:bg-surface-variant transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
