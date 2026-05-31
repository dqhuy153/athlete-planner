'use client';

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-accent/10 text-accent border border-accent/20',
    draft: 'bg-text-tertiary/20 text-text-secondary border border-text-tertiary/20',
    archived: 'bg-warning/10 text-warning border border-warning/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}
