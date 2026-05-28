'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Unified Markdown renderer for the entire Orbit system.
 *
 * Supports:
 *  - GFM: tables, strikethrough, task lists, autolinks
 *  - Fenced code blocks with syntax highlighting (rehype-highlight)
 *  - LaTeX / KaTeX math ($inline$ and $$block$$)
 *  - Images with optional captions
 *  - Clickable links (open in new tab)
 *  - Blockquotes, horizontal rules, headings h1–h6
 *  - Bold, italic, strikethrough, inline code
 *
 * Props:
 *  - `text` OR `content` — the markdown string (interchangeable)
 *  - `className` — extra wrapper classes
 *  - `compact` — tighter spacing (use for chat bubbles, dashboard snippets)
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return getTextContent(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props.children,
    );
  }
  return '';
}

export interface MarkdownRendererProps {
  /** Markdown string. Also accepts `content` as alias. */
  text?: string;
  /** Alias for `text`. Preferred when used in blog/article context. */
  content?: string;
  className?: string;
  /** Tighter spacing: use for chat bubbles, small snippets, dashboard cards. */
  compact?: boolean;
}

function preprocessLatex(text: string): string {
  let result = text;

  // 1. Map cũ: Bắt các macro liền mạch (Legacy compat)
  const legacyToUnicode: Record<string, string> = {
    textconjunction: '☌',
    textsquare: '□',
    textopp: '☍',
    texttrine: '△',
    textsextile: '⚹',
    textascendant: 'Asc',
    textdescendant: 'Desc',
    textmedium: 'MC',
    textfortune: 'Fortune',
  };

  Object.entries(legacyToUnicode).forEach(([cmd, symbol]) => {
    const regex = new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g');
    result = result.replace(regex, symbol);
  });

  // 2. Map MỚI: Bắt các cụm \text{word} do AI sinh ra
  const aiTextMap: Record<string, string> = {
    conj: '☌',
    conjunct: '☌',
    conjunction: '☌',
    opp: '☍',
    opposite: '☍',
    opposition: '☍',
    square: '□',
    trine: '△',
    sextile: '⚹',
    ascendant: 'Asc',
    descendant: 'Desc',
    medium: 'MC',
    fortune: 'Fortune',
  };

  // Regex bắt $\text{word}$ hoặc \text{word}
  result = result.replace(/(?:\$)?\\text\{([^}]+)\}(?:\$)?/gi, (match, word) => {
    const cleanWord = word.toLowerCase().trim();
    // Nếu từ khóa nằm trong từ điển chiêm tinh, trả về ký hiệu (vd: ☌)
    // Nếu không, trả về nguyên bản để KaTeX xử lý các text toán học bình thường
    return aiTextMap[cleanWord] || match;
  });

  return result;
}

export function MarkdownRenderer({
  text,
  content,
  className = '',
  compact = false,
}: MarkdownRendererProps) {
  const rawMarkdown = content ?? text ?? '';
  const markdown = preprocessLatex(rawMarkdown);

  const spacing = compact ? '[&>*+*]:mt-2 [&>p]:leading-relaxed [&>p]:text-sm' : '[&>*+*]:mt-4';

  return (
    <div className={`markdown-content ${spacing} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
        components={{
          // ── Headings ───────────────────────────────────────────────────
          h1: ({ children }) => (
            <h1
              id={slugify(getTextContent(children))}
              className={`font-serif text-primary font-semibold scroll-mt-20 ${compact ? 'text-lg mt-4 mb-2' : 'text-2xl mt-8 mb-4 first:mt-0'}`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={slugify(getTextContent(children))}
              className={`font-serif text-primary font-semibold scroll-mt-20 border-b border-primary/20 pb-2 ${compact ? 'text-base mt-3 mb-1.5' : 'text-xl mt-7 mb-3'}`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugify(getTextContent(children))}
              className={`font-serif text-on-surface font-semibold scroll-mt-20 ${compact ? 'text-sm mt-2 mb-1' : 'text-lg mt-5 mb-2'}`}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              id={slugify(getTextContent(children))}
              className={`font-serif text-on-surface font-semibold scroll-mt-20 ${compact ? 'text-xs mt-2 mb-1' : 'text-base mt-4 mb-2'}`}
            >
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-bold text-on-surface/80 mt-3 mb-1.5 uppercase tracking-wide">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-bold text-on-surface-variant mt-3 mb-1 uppercase tracking-widest">
              {children}
            </h6>
          ),

          // ── Paragraph (standalone image detection) ─────────────────────
          p: ({ children, node }) => {
            const elementChildren =
              node?.children?.filter(
                (c) =>
                  !(
                    'type' in c &&
                    c.type === 'text' &&
                    'value' in c &&
                    (c as { value: string }).value.trim() === ''
                  ),
              ) ?? [];
            const isAllImages =
              elementChildren.length > 0 &&
              elementChildren.every((c) => {
                if ('tagName' in c && c.tagName === 'img') return true;
                if ('tagName' in c && c.tagName === 'a' && 'children' in c) {
                  const kids = (c as { children: unknown[] }).children;
                  return (
                    Array.isArray(kids) &&
                    kids.some(
                      (k) =>
                        typeof k === 'object' &&
                        k !== null &&
                        'tagName' in k &&
                        (k as { tagName: string }).tagName === 'img',
                    )
                  );
                }
                return false;
              });
            if (isAllImages) {
              return <div className="my-6 text-center">{children}</div>;
            }
            return (
              <p
                className={`text-on-surface/85 leading-[1.8] ${compact ? 'text-sm mb-2' : 'text-[0.95rem] mb-5'}`}
              >
                {children}
              </p>
            );
          },

          // ── Links ──────────────────────────────────────────────────────
          a: ({ href, children, title }) => (
            <a
              href={href}
              title={title}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
            >
              {children}
            </a>
          ),

          // ── Images ─────────────────────────────────────────────────────
          img: ({ src, alt, title }) => (
            <span className="block my-4">
              <img
                src={src}
                alt={alt || ''}
                title={title || undefined}
                className="max-w-full md:max-w-2xl mx-auto rounded-lg shadow-md object-contain block my-4"
                loading="lazy"
                decoding="async"
              />
              {(alt || title) && (
                <span className="block text-center text-xs text-on-surface-variant mt-2 italic">
                  {alt || title}
                </span>
              )}
            </span>
          ),

          // ── Blockquote ─────────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-2 border-primary/60 bg-primary/5 rounded-r-xl italic text-on-surface/80 [&>p]:mb-0 [&>p]:text-[0.93rem] ${compact ? 'px-3 py-2 my-2' : 'px-5 py-4 my-6'}`}
            >
              {children}
            </blockquote>
          ),

          // ── Code blocks ────────────────────────────────────────────────
          pre: ({ children }) => (
            <div className={compact ? 'my-3' : 'my-6'}>
              <pre className="bg-[#0f1117] rounded-xl p-5 overflow-x-auto border border-primary/10 text-sm leading-relaxed font-mono text-[#e7e7e7]">
                {children}
              </pre>
            </div>
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = codeClass?.includes('hljs') || codeClass?.includes('language-');
            if (isBlock) {
              return (
                <code className={`${codeClass} text-[0.9em] font-mono`} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="text-primary/90 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-[0.87em] font-mono font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },

          // ── Lists ──────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul
              className={`ml-2 space-y-1.5 list-none [&>li]:relative [&>li]:pl-5 [&>li]:before:content-['✦'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-primary/60 [&>li]:before:text-[0.7rem] [&>li]:before:top-1 ${compact ? 'my-2' : 'my-4'}`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`ml-2 space-y-1.5 list-decimal list-outside pl-5 marker:text-primary marker:font-bold marker:text-sm ${compact ? 'my-2' : 'my-4'}`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className={`text-on-surface/85 leading-[1.75] ${compact ? 'text-sm' : 'text-[0.95rem]'}`}
            >
              {children}
            </li>
          ),

          // ── Tables ─────────────────────────────────────────────────────
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-outline-variant/20">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-container-high/80 text-on-surface text-xs uppercase tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left font-bold text-primary/90" {...(props as object)}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="px-4 py-3 border-t border-outline-variant/10 text-on-surface/80"
              {...(props as object)}
            >
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-surface-container/40 transition-colors">{children}</tr>
          ),

          // ── HR ─────────────────────────────────────────────────────────
          hr: () => (
            <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          ),

          // ── Inline formatting ──────────────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-bold text-primary/90">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-on-surface/90">{children}</em>,
          del: ({ children }) => (
            <del className="line-through text-on-surface-variant/60">{children}</del>
          ),

          // ── Task list checkboxes ───────────────────────────────────────
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 rounded border-outline-variant accent-primary align-middle"
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
