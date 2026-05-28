import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('appName')}</h1>
      <p className="mt-2 text-text-secondary">Training planner for hybrid athletes</p>
    </main>
  );
}
