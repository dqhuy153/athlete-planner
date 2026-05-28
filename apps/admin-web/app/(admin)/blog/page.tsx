'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getBlogPosts,
  getBlogCategories,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createBlogCategory,
  deleteBlogCategory,
} from '@/lib/api';
import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

export default function BlogPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Post form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState({ title: '', slug: '', content: '', categoryKey: '', published: false });

  // Category form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ key: '', label: '', emoji: '' });

  useEffect(() => {
    if (!session) return;
    loadData();
  }, [session]);

  async function loadData() {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        getBlogPosts(session!.accessToken, { page: 1, limit: 50 }),
        getBlogCategories(session!.accessToken),
      ]);
      setPosts(postsRes.posts);
      setCategories(catsRes);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePost() {
    if (!session) return;
    try {
      if (editingPost) {
        await updateBlogPost(session.accessToken, editingPost.id, postForm);
      } else {
        await createBlogPost(session.accessToken, postForm);
      }
      setShowPostForm(false);
      setEditingPost(null);
      setPostForm({ title: '', slug: '', content: '', categoryKey: '', published: false });
      loadData();
    } catch (e: any) {
      alert(e.message);
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

  async function handleSaveCat() {
    if (!session) return;
    try {
      await createBlogCategory(session.accessToken, catForm);
      setShowCatForm(false);
      setCatForm({ key: '', label: '', emoji: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDeleteCat(key: string) {
    if (!session || !confirm('Delete this category?')) return;
    try {
      await deleteBlogCategory(session.accessToken, key);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Blog</h1>
        <button
          onClick={() => {
            if (activeTab === 'posts') setShowPostForm(true);
            else setShowCatForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          {activeTab === 'posts' ? 'New Post' : 'New Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-outline">
        {(['posts', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-on-surface-variant">Loading...</div>
      ) : activeTab === 'posts' ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border border-outline bg-surface">
              <div>
                <p className="font-medium text-on-surface">{post.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  /{post.slug} · {post.categoryKey || 'no category'} ·{' '}
                  <span className={post.status === 'published' ? 'text-success' : 'text-on-surface-variant'}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setPostForm({ title: post.title, slug: post.slug, content: post.content || '', categoryKey: post.categoryKey || '', published: post.status === 'published' });
                    setShowPostForm(true);
                  }}
                  className="p-2 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-on-surface-variant text-sm">No posts yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between p-4 rounded-lg border border-outline bg-surface">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-on-surface-variant" />
                <span className="font-medium text-on-surface">{cat.label}</span>
                <span className="text-xs text-on-surface-variant">({cat.key})</span>
              </div>
              <button
                onClick={() => handleDeleteCat(cat.key)}
                className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-on-surface-variant text-sm">No categories yet.</p>
          )}
        </div>
      )}

      {/* Post form modal */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface rounded-xl border border-outline p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-on-surface">
              {editingPost ? 'Edit Post' : 'New Post'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                <input
                  value={postForm.title}
                  onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Slug</label>
                <input
                  value={postForm.slug}
                  onChange={(e) => setPostForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
                <select
                  value={postForm.categoryKey}
                  onChange={(e) => setPostForm((f) => ({ ...f, categoryKey: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Content (Markdown)</label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm((f) => ({ ...f, content: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={postForm.published}
                  onChange={(e) => setPostForm((f) => ({ ...f, published: e.target.checked }))}
                  className="accent-primary"
                />
                <label htmlFor="published" className="text-sm text-on-surface">Published</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowPostForm(false); setEditingPost(null); }}
                className="px-4 py-2 text-sm border border-outline rounded-lg text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePost}
                className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category form modal */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface rounded-xl border border-outline p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4 text-on-surface">New Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Key (unique identifier)</label>
                <input
                  value={catForm.key}
                  onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value }))}
                  placeholder="e.g. technology"
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Label</label>
                <input
                  value={catForm.label}
                  onChange={(e) => setCatForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Technology"
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Emoji (optional)</label>
                <input
                  value={catForm.emoji}
                  onChange={(e) => setCatForm((f) => ({ ...f, emoji: e.target.value }))}
                  placeholder="e.g. 💻"
                  className="w-full px-3 py-2 text-sm bg-background border border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCatForm(false)} className="px-4 py-2 text-sm border border-outline rounded-lg text-on-surface hover:bg-surface-variant transition-colors">Cancel</button>
              <button onClick={handleSaveCat} className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
