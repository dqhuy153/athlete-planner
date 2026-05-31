'use client';

import type { BlogCategory } from '@athlete-planner/contracts';
import { Button } from '@athlete-planner/ui';
import type { CatForm } from './types';

interface BlogCategoryFormModalProps {
  editingCat: BlogCategory | null;
  catForm: CatForm;
  setCatForm: React.Dispatch<React.SetStateAction<CatForm>>;
  handleSaveCat: () => void;
  onClose: () => void;
}

export function BlogCategoryFormModal({
  editingCat,
  catForm,
  setCatForm,
  handleSaveCat,
  onClose,
}: BlogCategoryFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-[20px] border border-border p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-base font-bold mb-5 text-foreground">
          {editingCat ? 'Edit Category' : 'New Category'}
        </h2>
        <div className="space-y-4">
          {!editingCat && (
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Key <span className="text-on-surface-variant/60">(unique, permanent)</span></label>
              <input
                value={catForm.key}
                onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                placeholder="strength"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Label</label>
            <input
              value={catForm.label}
              onChange={(e) => setCatForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Strength Training"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Description <span className="text-on-surface-variant/60">(optional)</span></label>
            <input
              value={catForm.description}
              onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Workouts and techniques…"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Image URL <span className="text-on-surface-variant/60">(optional)</span></label>
            <input
              value={catForm.imageUrl}
              onChange={(e) => setCatForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://…"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="surface" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSaveCat}>
            {editingCat ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
}
