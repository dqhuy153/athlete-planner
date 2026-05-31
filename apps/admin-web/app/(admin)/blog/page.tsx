'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getBlogPosts,
  getBlogCategories,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from '@/lib/api';
import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { BlogStatus } from '@athlete-planner/contracts';
import {
  Plus, Pencil, Trash2, ChevronLeft,
  FileText, Tag, Clock, Image, AlignLeft, Globe,
  BookOpen, Columns2, LayoutList,
} from 'lucide-react';
import { MarkdownRenderer, ConfirmModal } from '@athlete-planner/ui';
import { Select } from '@athlete-planner/ui';
import { useToast } from '@/components/ui/toast';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'raw' | 'split' | 'preview';

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  categoryKey: string;
  status: BlogStatus;
  readingTime: number;
}

const EMPTY_FORM: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  categoryKey: '',
  status: BlogStatus.DRAFT,
  readingTime: 1,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
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

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { session } = useAuth();
  const { push } = useToast();

  // Confirm-delete state
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'post' | 'cat'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // List state
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editing, setEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Category form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<BlogCategory | null>(null);
  const [catForm, setCatForm] = useState({ label: '', key: '', description: '', imageUrl: '' });

  useEffect(() => {
    if (!session) return;
    loadData();
  }, [session]);

  async function loadData() {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        getBlogPosts(session!.accessToken, { limit: 100, status: 'all' } as any),
        getBlogCategories(session!.accessToken),
      ]);
      setPosts(postsRes?.posts ?? []);
      setCategories(catsRes ?? []);
    } catch (e: any) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Form helpers ──

  function openNewPost() {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setError('');
    setEditing(true);
  }

  function openEditPost(post: BlogPost) {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      coverImage: post.coverImage ?? '',
      tags: (post.tags ?? []).join(', '),
      categoryKey: post.categoryKey ?? '',
      status: post.status as BlogStatus,
      readingTime: post.readingTime ?? 1,
    });
    setError('');
    setEditing(true);
  }

  function closeEditor() {
    setEditing(false);
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  const handleTitleChange = useCallback((title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug || slugify(title),
      readingTime: calcReadingTime(f.content || title),
    }));
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setForm((f) => ({ ...f, content, readingTime: calcReadingTime(content) }));
  }, []);

  async function handleSavePost() {
    if (!session) return;
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        coverImage: form.coverImage.trim() || undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        categoryKey: form.categoryKey || undefined,
        status: form.status,
        readingTime: form.readingTime,
      };
      if (editingPost) {
        await updateBlogPost(session.accessToken, editingPost.id, payload);
      } else {
        await createBlogPost(session.accessToken, payload);
      }
      closeEditor();
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(id: string) {
    setConfirmDelete({ type: 'post', id });
  }

  async function executeDeletePost(id: string) {
    if (!session) return;
    setDeleting(true);
    try {
      await deleteBlogPost(session.accessToken, id);
      loadData();
    } catch (e: any) {
      push({ title: e.message || 'Failed to delete post', tone: 'error' });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  // ── Category helpers ──

  function openNewCategory() {
    setEditingCat(null);
    setCatForm({ label: '', key: '', description: '', imageUrl: '' });
    setShowCatForm(true);
  }

  function openEditCategory(cat: BlogCategory) {
    setEditingCat(cat);
    setCatForm({ label: cat.label, key: cat.key, description: cat.description ?? '', imageUrl: cat.imageUrl ?? '' });
    setShowCatForm(true);
  }

  async function handleSaveCat() {
    if (!session || !catForm.label.trim()) return;
    try {
      if (editingCat) {
        await updateBlogCategory(session.accessToken, editingCat.id, {
          label: catForm.label.trim(),
          description: catForm.description.trim() || undefined,
          imageUrl: catForm.imageUrl.trim() || undefined,
        });
      } else {
        if (!catForm.key.trim()) {
          push({ title: 'Key is required for new category.', tone: 'error' });
          return;
        }
        await createBlogCategory(session.accessToken, {
          key: catForm.key.trim(),
          label: catForm.label.trim(),
          description: catForm.description.trim() || undefined,
          imageUrl: catForm.imageUrl.trim() || undefined,
        });
      }
      setShowCatForm(false);
      setEditingCat(null);
      loadData();
    } catch (e: any) {
      push({ title: e.message || 'Failed to save category', tone: 'error' });
    }
  }

  async function handleDeleteCat(id: string) {
    setConfirmDelete({ type: 'cat', id });
  }

  async function executeDeleteCat(id: string) {
    if (!session) return;
    setDeleting(true);
    try {
      await deleteBlogCategory(session.accessToken, id);
      loadData();
    } catch (e: any) {
      push({ title: e.message || 'Failed to delete category', tone: 'error' });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  // ── Editor view ──────────────────────────────────────────────────────────

  if (editing) {
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

            <button
              onClick={handleSavePost}
              disabled={saving}
              className="h-8 px-4 text-xs font-semibold rounded-lg bg-accent text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingPost ? 'Update' : 'Publish'}
            </button>
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

  // ── List view ────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Blog</h1>
        <button
          onClick={() => {
            if (activeTab === 'posts') openNewPost();
            else openNewCategory();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          {activeTab === 'posts' ? 'New Post' : 'New Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['posts', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-on-surface-variant hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-on-surface-variant text-sm">Loading…</div>
      ) : activeTab === 'posts' ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 rounded-[20px] border border-border bg-surface hover:border-border/60 transition-colors group"
            >
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImage} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0 border border-border" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-on-surface-variant" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{post.title}</p>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 font-mono">/{post.slug}</p>
                <div className="flex items-center gap-3 mt-1">
                  {post.categoryKey && (
                    <span className="text-xs text-on-surface-variant">{post.categoryKey}</span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <Clock size={10} />
                    {post.readingTime} min
                  </span>
                  {post.tags?.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <Tag size={10} />
                      {post.tags.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditPost(post)}
                  className="p-2 rounded-lg hover:bg-surface-3 text-on-surface-variant hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={40} className="text-on-surface-variant mb-3" />
              <p className="text-on-surface-variant text-sm">No posts yet</p>
              <p className="text-on-surface-variant text-xs mt-1">Click &ldquo;New Post&rdquo; to start writing</p>
            </div>
          )}
        </div>
      ) : (
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
          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag size={40} className="text-on-surface-variant mb-3" />
              <p className="text-on-surface-variant text-sm">No categories yet</p>
            </div>
          )}
        </div>
      )}

      {/* Category form modal */}
      {showCatForm && (
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
              <button
                onClick={() => { setShowCatForm(false); setEditingCat(null); }}
                className="px-4 py-2 text-sm border border-border rounded-lg text-on-surface-variant hover:text-foreground hover:border-border/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCat}
                className="px-4 py-2 text-sm bg-accent text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingCat ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmDelete !== null}
        title={confirmDelete?.type === 'post' ? 'Delete post' : 'Delete category'}
        message={
          confirmDelete?.type === 'post'
            ? 'This post will be permanently deleted.'
            : 'This category will be permanently deleted.'
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => {
          if (!confirmDelete) return;
          if (confirmDelete.type === 'post') executeDeletePost(confirmDelete.id);
          else executeDeleteCat(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
