'use client';

import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { BlogStatus } from '@athlete-planner/contracts';
import {
  ChevronLeft, FileText, Tag, Clock, Image, AlignLeft, Globe,
  BookOpen, Columns2, LayoutList,
} from 'lucide-react';
import { MarkdownRenderer, Button } from '@athlete-planner/ui';
import { Select } from '@athlete-planner/ui';
import type { ViewMode, PostForm } from './types';

interface BlogEditorViewProps {
  editingPost: BlogPost | null;
  form: PostForm;
  setForm: React.Dispatch<React.SetStateAction<PostForm>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  saving: boolean;
  error: string;
  categories: BlogCategory[];
  closeEditor: () => void;
  handleSavePost: () => void;
  handleTitleChange: (title: string) => void;
  handleContentChange: (content: string) => void;
}

export function BlogEditorView({
  editingPost,
  form,
  setForm,
  viewMode,
  setViewMode,
  saving,
  error,
  categories,
  closeEditor,
  handleSavePost,
  handleTitleChange,
  handleContentChange,
}: BlogEditorViewProps) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Editor toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
        <button
          onClick={closeEditor}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          Posts
        </button>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm font-medium text-foreground truncate max-w-xs">
          {editingPost ? 'Edit Post' : 'New Post'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
            {([
              { mode: 'raw' as ViewMode, icon: <FileText size={14} />, label: 'Raw' },
              { mode: 'split' as ViewMode, icon: <Columns2 size={14} />, label: 'Split' },
              { mode: 'preview' as ViewMode, icon: <BookOpen size={14} />, label: 'Preview' },
            ]).map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-surface-3 text-foreground'
                    : 'text-on-surface-variant hover:text-foreground'
                }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <Select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BlogStatus }))}
            className="h-8 px-2 py-1 text-xs"
          >
            <option value={BlogStatus.DRAFT}>Draft</option>
            <option value={BlogStatus.PUBLISHED}>Published</option>
            <option value={BlogStatus.ARCHIVED}>Archived</option>
          </Select>

          <Button
            onClick={handleSavePost}
            disabled={saving}
            variant="accent"
            size="sm"
          >
            {saving ? 'Saving…' : editingPost ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-error/10 border-b border-error/20 text-xs text-error shrink-0">
          {error}
        </div>
      )}

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Metadata sidebar */}
        <div className="w-64 shrink-0 border-r border-border bg-surface overflow-y-auto p-4 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
              <Globe size={12} /> Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="post-url-slug"
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
              <AlignLeft size={12} /> Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short summary…"
              rows={3}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
              <Image size={12} /> Cover Image URL
            </label>
            <input
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://…"
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="" className="mt-2 w-full h-24 object-cover rounded-lg border border-border" />
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
              <LayoutList size={12} /> Category
            </label>
            <Select
              value={form.categoryKey}
              onChange={(e) => setForm((f) => ({ ...f, categoryKey: e.target.value }))}
              className="text-xs px-2 py-1 h-auto"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
              <Tag size={12} /> Tags
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="strength, recovery, …"
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[10px] text-on-surface-variant">Comma-separated</p>
            {form.tags && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
              <Clock size={12} /> Reading Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={form.readingTime}
                onChange={(e) => setForm((f) => ({ ...f, readingTime: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-16 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <span className="text-xs text-on-surface-variant">min</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Title + editor */}
          {(viewMode === 'raw' || viewMode === 'split') && (
            <div className={`flex flex-col overflow-hidden ${viewMode === 'split' ? 'w-1/2 border-r border-border' : 'flex-1'}`}>
              <div className="px-6 pt-5 pb-3 shrink-0">
                <input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Post title…"
                  className="w-full text-xl font-bold bg-transparent text-foreground placeholder-on-surface-variant/50 focus:outline-none border-b border-border pb-2"
                />
              </div>
              <textarea
                value={form.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write in Markdown…"
                className="flex-1 px-6 py-4 text-sm bg-transparent text-foreground placeholder-on-surface-variant/50 focus:outline-none resize-none font-mono leading-relaxed overflow-y-auto"
              />
            </div>
          )}

          {/* Preview pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`overflow-y-auto bg-background ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}`}>
              <div className="px-8 py-6">
                {viewMode === 'preview' && (
                  <h1 className="text-2xl font-bold text-foreground mb-4">{form.title || 'Untitled'}</h1>
                )}
                {form.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverImage} alt="" className="w-full h-48 object-cover rounded-xl mb-6 border border-border" />
                )}
                <MarkdownRenderer content={form.content || '*No content yet…*'} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
