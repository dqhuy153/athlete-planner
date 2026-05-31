'use client';

import type { BlogPost } from '@athlete-planner/contracts';
import { FileText, Clock, Tag, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface BlogPostListProps {
  posts: BlogPost[];
  openEditPost: (post: BlogPost) => void;
  handleDeletePost: (id: string) => void;
}

export function BlogPostList({ posts, openEditPost, handleDeletePost }: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText size={40} className="text-on-surface-variant mb-3" />
        <p className="text-on-surface-variant text-sm">No posts yet</p>
        <p className="text-on-surface-variant text-xs mt-1">Click &ldquo;New Post&rdquo; to start writing</p>
      </div>
    );
  }

  return (
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
    </div>
  );
}
