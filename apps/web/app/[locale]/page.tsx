import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LandingClient } from './LandingClient';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Server-side auth check — reads the JWT directly from the cookie.
  // This avoids the 30s /api/auth/session cold-start delay on iOS Safari PWA
  // reload. If the user is signed in, redirect happens before any client JS runs.
  const session = await auth();
  if (session) {
    redirect(`/${locale}/schedule`);
  }

  return <LandingClient locale={locale} />;
}
