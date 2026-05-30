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
import { MarkdownRenderer } from '@athlete-planner/ui';

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
    published: 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20',
    draft: 'bg-[#525252]/20 text-[#A3A3A3] border border-[#525252]/20',
    archived: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
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
      console.error(e);
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
    if (!session || !confirm('Delete this post?')) return;
    try {
      await deleteBlogPost(session.accessToken, id);
      loadData();
    } catch (e: any) {
      alert(e.message);
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
        if (!catForm.key.trim()) { alert('Key is required for new category.'); return; }
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
      alert(e.message);
    }
  }

  async function handleDeleteCat(id: string) {
    if (!session || !confirm('Delete this category?')) return;
    try {
      await deleteBlogCategory(session.accessToken, id);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  }

  // ── Editor view ──────────────────────────────────────────────────────────

  if (editing) {
    return (
      <div className="flex flex-col h-screen bg-[#0A0A0A] overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#242424] bg-[#141414] shrink-0">
          <button
            onClick={closeEditor}
            className="flex items-center gap-1.5 text-sm text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
          >
            <ChevronLeft size={16} />
            Posts
          </button>
          <div className="h-4 w-px bg-[#242424]" />
          <span className="text-sm font-medium text-[#FAFAFA] truncate max-w-xs">
            {editingPost ? 'Edit Post' : 'New Post'}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-[#242424] bg-[#0A0A0A] p-1">
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
                      ? 'bg-[#242424] text-[#FAFAFA]'
                      : 'text-[#A3A3A3] hover:text-[#FAFAFA]'
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BlogStatus }))}
              className="h-8 px-2 text-xs rounded-lg border border-[#242424] bg-[#141414] text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]"
            >
              <option value={BlogStatus.DRAFT}>Draft</option>
              <option value={BlogStatus.PUBLISHED}>Published</option>
              <option value={BlogStatus.ARCHIVED}>Archived</option>
            </select>

            <button
              onClick={handleSavePost}
              disabled={saving}
              className="h-8 px-4 text-xs font-semibold rounded-lg bg-[#00D4AA] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingPost ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 bg-[#EF4444]/10 border-b border-[#EF4444]/20 text-xs text-[#EF4444] shrink-0">
            {error}
          </div>
        )}

        {/* Main editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Metadata sidebar */}
          <div className="w-64 shrink-0 border-r border-[#242424] bg-[#141414] overflow-y-auto p-4 space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] mb-1.5">
                <Globe size={12} /> Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="post-url-slug"
                className="w-full px-2.5 py-1.5 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-1 focus:ring-[#00D4AA] font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] mb-1.5">
                <AlignLeft size={12} /> Excerpt
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short summary…"
                rows={3}
                className="w-full px-2.5 py-1.5 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-1 focus:ring-[#00D4AA] resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] mb-1.5">
                <Image size={12} /> Cover Image URL
              </label>
              <input
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://…"
                className="w-full px-2.5 py-1.5 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]"
              />
              {form.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImage} alt="" className="mt-2 w-full h-24 object-cover rounded-lg border border-[#242424]" />
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] mb-1.5">
                <LayoutList size={12} /> Category
              </label>
              <select
                value={form.categoryKey}
                onChange={(e) => setForm((f) => ({ ...f, categoryKey: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] mb-1.5">
                <Tag size={12} /> Tags
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="strength, recovery, …"
                className="w-full px-2.5 py-1.5 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]"
              />
              <p className="mt-1 text-[10px] text-[#525252]">Comma-separated</p>
              {form.tags && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] mb-1.5">
                <Clock size={12} /> Reading Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={form.readingTime}
                  onChange={(e) => setForm((f) => ({ ...f, readingTime: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-16 px-2.5 py-1.5 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA] font-mono"
                />
                <span className="text-xs text-[#525252]">min</span>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Title + editor */}
            {(viewMode === 'raw' || viewMode === 'split') && (
              <div className={`flex flex-col overflow-hidden ${viewMode === 'split' ? 'w-1/2 border-r border-[#242424]' : 'flex-1'}`}>
                <div className="px-6 pt-5 pb-3 shrink-0">
                  <input
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Post title…"
                    className="w-full text-xl font-bold bg-transparent text-[#FAFAFA] placeholder-[#525252] focus:outline-none border-b border-[#242424] pb-2"
                  />
                </div>
                <textarea
                  value={form.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Write in Markdown…"
                  className="flex-1 px-6 py-4 text-sm bg-transparent text-[#FAFAFA] placeholder-[#525252] focus:outline-none resize-none font-mono leading-relaxed overflow-y-auto"
                />
              </div>
            )}

            {/* Preview pane */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`overflow-y-auto bg-[#0A0A0A] ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}`}>
                <div className="px-8 py-6">
                  {viewMode === 'preview' && (
                    <h1 className="text-2xl font-bold text-[#FAFAFA] mb-4">{form.title || 'Untitled'}</h1>
                  )}
                  {form.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.coverImage} alt="" className="w-full h-48 object-cover rounded-xl mb-6 border border-[#242424]" />
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
        <h1 className="text-2xl font-bold text-[#FAFAFA]">Blog</h1>
        <button
          onClick={() => {
            if (activeTab === 'posts') openNewPost();
            else openNewCategory();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          {activeTab === 'posts' ? 'New Post' : 'New Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#242424]">
        {(['posts', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-[#00D4AA] text-[#00D4AA]'
                : 'border-transparent text-[#A3A3A3] hover:text-[#FAFAFA]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#A3A3A3] text-sm">Loading…</div>
      ) : activeTab === 'posts' ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#242424] bg-[#141414] hover:border-[#525252] transition-colors group"
            >
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImage} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0 border border-[#242424]" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#1A1A1A] border border-[#242424] flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#525252]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#FAFAFA] truncate">{post.title}</p>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-xs text-[#525252] mt-0.5 font-mono">/{post.slug}</p>
                <div className="flex items-center gap-3 mt-1">
                  {post.categoryKey && (
                    <span className="text-xs text-[#A3A3A3]">{post.categoryKey}</span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-[#525252]">
                    <Clock size={10} />
                    {post.readingTime} min
                  </span>
                  {post.tags?.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[#525252]">
                      <Tag size={10} />
                      {post.tags.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditPost(post)}
                  className="p-2 rounded-lg hover:bg-[#242424] text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#A3A3A3] hover:text-[#EF4444] transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={40} className="text-[#525252] mb-3" />
              <p className="text-[#A3A3A3] text-sm">No posts yet</p>
              <p className="text-[#525252] text-xs mt-1">Click &ldquo;New Post&rdquo; to start writing</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-4 p-4 rounded-xl border border-[#242424] bg-[#141414] hover:border-[#525252] transition-colors group">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-[#242424]" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#242424] flex items-center justify-center shrink-0">
                  <Tag size={16} className="text-[#525252]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#FAFAFA]">{cat.label}</span>
                  <span className="text-xs text-[#525252] font-mono">({cat.key})</span>
                  {!cat.isActive && (
                    <span className="text-xs text-[#F59E0B]">inactive</span>
                  )}
                </div>
                {cat.description && (
                  <p className="text-xs text-[#A3A3A3] mt-0.5 truncate">{cat.description}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditCategory(cat)}
                  className="p-2 rounded-lg hover:bg-[#242424] text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCat(cat.id)}
                  className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#A3A3A3] hover:text-[#EF4444] transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag size={40} className="text-[#525252] mb-3" />
              <p className="text-[#A3A3A3] text-sm">No categories yet</p>
            </div>
          )}
        </div>
      )}

      {/* Category form modal */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#141414] rounded-2xl border border-[#242424] p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-base font-bold mb-5 text-[#FAFAFA]">
              {editingCat ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="space-y-4">
              {!editingCat && (
                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Key <span className="text-[#525252]">(unique, permanent)</span></label>
                  <input
                    value={catForm.key}
                    onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                    placeholder="strength"
                    className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#00D4AA] font-mono"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Label</label>
                <input
                  value={catForm.label}
                  onChange={(e) => setCatForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="Strength Training"
                  className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#00D4AA]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Description <span className="text-[#525252]">(optional)</span></label>
                <input
                  value={catForm.description}
                  onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Workouts and techniques…"
                  className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#00D4AA]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Image URL <span className="text-[#525252]">(optional)</span></label>
                <input
                  value={catForm.imageUrl}
                  onChange={(e) => setCatForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FAFAFA] placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#00D4AA]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowCatForm(false); setEditingCat(null); }}
                className="px-4 py-2 text-sm border border-[#242424] rounded-lg text-[#A3A3A3] hover:text-[#FAFAFA] hover:border-[#525252] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCat}
                className="px-4 py-2 text-sm bg-[#00D4AA] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingCat ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
