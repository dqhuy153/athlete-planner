import { getTranslations } from 'next-intl/server';
import { LibraryTabs } from './LibraryTabs';
import { LibraryHeaderClient } from './LibraryHeaderClient';

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
      {/* Client header toggles sticky for authenticated users only */}
      <LibraryHeaderClient locale={locale} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">{children}</div>
    </div>
  );
}
