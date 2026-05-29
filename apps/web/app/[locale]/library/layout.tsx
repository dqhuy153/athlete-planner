import { getTranslations } from 'next-intl/server';
import { LibraryTabs } from './LibraryTabs';

export default async function LibraryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('library');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4 pb-0">
          <h1 className="text-heading font-bold text-text-primary text-balance mb-3">
            {t('title')}
          </h1>
          <LibraryTabs locale={locale} />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">{children}</div>
    </div>
  );
}
