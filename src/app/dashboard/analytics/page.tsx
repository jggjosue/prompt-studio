import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const CLERK_DASHBOARD_OVERVIEW_URL = 'https://dashboard.clerk.com/';

export default async function DashboardAnalyticsPage() {
  const t = await getTranslations('dashboardAnalytics');

  const metrics = [
    { key: 'activeUser', label: t('metrics.activeUser.title'), desc: t('metrics.activeUser.desc') },
    { key: 'signIn', label: t('metrics.signIn.title'), desc: t('metrics.signIn.desc') },
    { key: 'signUp', label: t('metrics.signUp.title'), desc: t('metrics.signUp.desc') },
    { key: 'retention', label: t('metrics.retention.title'), desc: t('metrics.retention.desc') },
    { key: 'freshness', label: t('metrics.freshness.title'), desc: t('metrics.freshness.desc') },
  ] as const;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('clerkTitle')}</CardTitle>
          <CardDescription>{t('clerkDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link
              href={CLERK_DASHBOARD_OVERVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('openClerkDashboard')}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('methodologyTitle')}</CardTitle>
          <CardDescription>{t('methodologyDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map(metric => (
            <div
              key={metric.key}
              className="rounded-lg border p-4 space-y-1"
            >
              <p className="font-medium text-sm">{metric.label}</p>
              <p className="text-sm text-muted-foreground">{metric.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">{t('faqTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t('faqDev')}</p>
          <p>{t('faqImpersonation')}</p>
          <p>{t('faqBots')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
