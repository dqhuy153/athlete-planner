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
import { Plus } from 'lucide-react';
import { ConfirmModal, Button } from '@athlete-planner/ui';
import { useToast } from '@/components/ui/toast';
import { BlogEditorView } from './components/BlogEditorView';
import { BlogPostList } from './components/BlogPostList';
import { BlogCategoryList } from './components/BlogCategoryList';
import { BlogCategoryFormModal } from './components/BlogCategoryFormModal';
import { slugify, calcReadingTime, EMPTY_FORM } from './components/types';
import type { ViewMode, PostForm, CatForm } from './components/types';

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
  const [catForm, setCatForm] = useState<CatForm>({ label: '', key: '', description: '', imageUrl: '' });

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
      status: post.status as any,
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
      <BlogEditorView
        editingPost={editingPost}
        form={form}
        setForm={setForm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        saving={saving}
        error={error}
        categories={categories}
        closeEditor={closeEditor}
        handleSavePost={handleSavePost}
        handleTitleChange={handleTitleChange}
        handleContentChange={handleContentChange}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Blog</h1>
        <Button
          onClick={() => {
            if (activeTab === 'posts') openNewPost();
            else openNewCategory();
          }}
          variant="accent"
        >
          <Plus size={16} />
          {activeTab === 'posts' ? 'New Post' : 'New Category'}
        </Button>
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
        <BlogPostList
          posts={posts}
          openEditPost={openEditPost}
          handleDeletePost={handleDeletePost}
        />
      ) : (
        <BlogCategoryList
          categories={categories}
          openEditCategory={openEditCategory}
          handleDeleteCat={handleDeleteCat}
        />
      )}

      {/* Category form modal */}
      {showCatForm && (
        <BlogCategoryFormModal
          editingCat={editingCat}
          catForm={catForm}
          setCatForm={setCatForm}
          handleSaveCat={handleSaveCat}
          onClose={() => { setShowCatForm(false); setEditingCat(null); }}
        />
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
