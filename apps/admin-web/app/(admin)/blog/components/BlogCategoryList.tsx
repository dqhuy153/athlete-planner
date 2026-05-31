'use client';

import type { BlogCategory } from '@athlete-planner/contracts';
import { Tag, Pencil, Trash2 } from 'lucide-react';

interface BlogCategoryListProps {
  categories: BlogCategory[];
  openEditCategory: (cat: BlogCategory) => void;
  handleDeleteCat: (id: string) => void;
}

export function BlogCategoryList({ categories, openEditCategory, handleDeleteCat }: BlogCategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Tag size={40} className="text-on-surface-variant mb-3" />
        <p className="text-on-surface-variant text-sm">No categories yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div key={cat.key} className="flex items-center gap-4 p-4 rounded-[20px] border border-border bg-surface hover:border-border/60 transition-colors group">
          {cat.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cat.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-border" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
              <Tag size={16} className="text-on-surface-variant" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{cat.label}</span>
              <span className="text-xs text-on-surface-variant font-mono">({cat.key})</span>
              {!cat.isActive && (
                <span className="text-xs text-warning">inactive</span>
              )}
            </div>
            {cat.description && (
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">{cat.description}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEditCategory(cat)}
              className="p-2 rounded-lg hover:bg-surface-3 text-on-surface-variant hover:text-foreground transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => handleDeleteCat(cat.id)}
              className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
