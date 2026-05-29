import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function markdownToHtml(md: string): string {
  return md
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-6 text-text-primary">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-8 mb-3 text-text-primary border-b border-border pb-1">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>')
    // List items (must come before paragraph conversion)
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-text-secondary">$1</li>')
    // Italic / emphasized line (used for date)
    .replace(/^_(.+)_$/gm, '<p class="text-xs text-text-tertiary mb-6 italic">$1</p>')
    // Blank lines → paragraph breaks
    .replace(/\n\n/g, '\n</p>\n<p class="mb-3 text-sm text-text-secondary leading-relaxed">\n')
    // Wrap plain lines not already in tags
    .replace(/^(?!<[h|u|l|p|/])(.+)$/gm, '<p class="mb-3 text-sm text-text-secondary leading-relaxed">$1</p>');
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;

  let content: string;
  try {
    const filePath = join(process.cwd(), '../../content/legal', `terms.${locale}.md`);
    content = readFileSync(filePath, 'utf-8');
  } catch {
    try {
      content = readFileSync(join(process.cwd(), '../../content/legal', 'terms.en.md'), 'utf-8');
    } catch {
      notFound();
    }
  }

  const html = markdownToHtml(content);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ArrowLeft size={14} aria-hidden />
        {locale === 'vi' ? 'Trang chủ' : 'Home'}
      </Link>
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
