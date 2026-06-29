'use client';

import { ProfileSubscriptionInfo } from '@/components/profile-subscription-info';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { Copy, LineChart, Link2, Package, Sparkles, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getSiteUrl } from '@/lib/site-url';
import type { AffiliateDashboardStats } from '@/lib/affiliate-mongo';
import { AFFILIATE_MIN_PAYOUT_CENTS } from '@/lib/affiliate';

type ProfileUser = {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  fullName: string;
  picture: string | null;
};

type AffiliateSale = {
  product: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
};

type ProfileClientProps = {
  user: ProfileUser;
  affiliate: AffiliateDashboardStats;
  affiliatePaypalEmail?: string | null;
};

function money(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function relativeLink(userId: string): string {
  const SITE_URL = getSiteUrl();
  return `${SITE_URL}/landing-pages?ref=${encodeURIComponent(userId)}`;
}

export default function ProfileClient({ user, affiliate, affiliatePaypalEmail }: ProfileClientProps) {
  const t = useTranslations('profile');
  const { plan, status, purchasedPages, ready } = useStripeSubscription();
  const [copied, setCopied] = useState(false);
  const [chartMode, setChartMode] = useState<'day' | 'week'>('day');
  const [paypalEmail, setPaypalEmail] = useState(affiliatePaypalEmail ?? '');
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSaved, setPaypalSaved] = useState(false);

  const displayName =
    user.fullName || user.email || t('member');

  const initials =
    `${user.givenName?.[0] ?? ''}${user.familyName?.[0] ?? ''}`.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    '?';

  const affiliateLink = useMemo(() => relativeLink(affiliate.referralCode || user.id), [affiliate.referralCode, user.id]);

  const affiliateSales = useMemo<AffiliateSale[]>(() => {
    return (affiliate.commissions ?? []).map(record => ({
      product: record.productName,
      date: new Date(record.createdAt).toLocaleDateString(),
      amount: record.commissionCents / 100,
      status: record.status === 'paid' ? 'paid' : 'pending',
    }));
  }, [affiliate.commissions]);

  const totalRevenue = affiliate.totalRevenueCents / 100;
  const paidRevenue = affiliate.paidRevenueCents / 100;
  const availablePayout = affiliate.availablePayoutCents / 100;
  const payoutThreshold = AFFILIATE_MIN_PAYOUT_CENTS / 100;
  const conversionRate = affiliate.conversionRate;
  const clicks = affiliate.clicks;

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of affiliate.commissions ?? []) {
      counts.set(record.productName, (counts.get(record.productName) ?? 0) + 1);
    }
    const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const source = ranked.length > 0 ? ranked : purchasedPages.map(page => [page, 1] as const);
    return source.slice(0, 4).map(([label, value]) => ({
      label: label.replace(/-/g, ' '),
      value: Math.min(100, value * 25),
    }));
  }, [affiliate.commissions, purchasedPages]);

  const chartSeries = useMemo(() => {
    const source = affiliate.history.slice(-28);
    if (chartMode === 'day') {
      return source.map(item => ({
        label: item.dateKey.slice(5),
        revenueCents: item.totalRevenueCents,
        commissionCents: item.paidRevenueCents,
        salesCount: item.salesCount,
      }));
    }

    const weekly = new Map<string, { label: string; revenueCents: number; commissionCents: number; salesCount: number }>();
    for (const item of source) {
      const date = new Date(`${item.dateKey}T00:00:00Z`);
      const day = date.getUTCDay();
      const monday = new Date(date);
      monday.setUTCDate(date.getUTCDate() - ((day + 6) % 7));
      const label = `${String(monday.getUTCMonth() + 1).padStart(2, '0')}/${String(monday.getUTCDate()).padStart(2, '0')}`;
      const key = monday.toISOString().slice(0, 10);
      const bucket = weekly.get(key) ?? { label, revenueCents: 0, commissionCents: 0, salesCount: 0 };
      bucket.revenueCents += item.totalRevenueCents;
      bucket.commissionCents += item.paidRevenueCents;
      bucket.salesCount += item.salesCount;
      weekly.set(key, bucket);
    }

    return Array.from(weekly.values());
  }, [affiliate.history, chartMode]);

  const chartMax = Math.max(1, ...chartSeries.map(item => item.revenueCents));
  const chartCommissionMax = Math.max(1, ...chartSeries.map(item => item.commissionCents ?? 0));
  const chartPoints = chartSeries.map((item, index) => {
    const x = chartSeries.length <= 1 ? 50 : (index / (chartSeries.length - 1)) * 100;
    const y = 100 - (item.revenueCents / chartMax) * 100;
    return { x, y };
  });
  const commissionPoints = chartSeries.map((item, index) => {
    const x = chartSeries.length <= 1 ? 50 : (index / (chartSeries.length - 1)) * 100;
    const y = 100 - ((item.commissionCents ?? 0) / chartCommissionMax) * 100;
    return { x, y };
  });
  const chartLinePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const commissionLinePath = commissionPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  if (!ready) {
    return (
      <div className="flex-1 space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function savePaypalEmail() {
    const value = paypalEmail.trim();
    if (!value) return;

    setSavingPaypal(true);
    setPaypalSaved(false);

    try {
      const response = await fetch('/api/profile/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypalEmail: value }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'No se pudo guardar el correo.');
      }

      setPaypalSaved(true);
      window.setTimeout(() => setPaypalSaved(false), 2500);
    } catch (error) {
      console.error('Failed to save PayPal email:', error);
    } finally {
      setSavingPaypal(false);
    }
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="profile">{t('profileTab')}</TabsTrigger>
          <TabsTrigger value="affiliate">{t('affiliateTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <User className="h-5 w-5" />
                {t('accountTitle')}
              </CardTitle>
              <CardDescription>{t('accountDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center text-lg font-semibold">
                  {user.picture ? (
                    <img src={user.picture} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-lg font-semibold truncate">{displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.id && (
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      ID: {user.id}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-first-name">{t('firstName')}</Label>
                  <Input
                    id="profile-first-name"
                    value={user.givenName}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-last-name">{t('lastName')}</Label>
                  <Input
                    id="profile-last-name"
                    value={user.familyName}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="profile-email">{t('email')}</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t('accountManaged')}</p>
            </CardContent>
          </Card>

          <ProfileSubscriptionInfo />
        </TabsContent>

        <TabsContent value="affiliate" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Link2 className="h-5 w-5" />
                {t('affiliateTitle')}
              </CardTitle>
              <CardDescription>{t('affiliateDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-background/55 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t('affiliateLink')}</p>
                        <p className="text-sm text-muted-foreground">
                          Comparte este enlace para rastrear las ventas.
                        </p>
                      </div>
                      <Badge variant={copied ? 'default' : 'secondary'} className="w-fit">
                        {copied ? 'Copiado' : 'Activo'}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="affiliate-link"
                        value={affiliateLink}
                        readOnly
                        className="bg-background/80 font-mono text-xs"
                      />
                      <Button variant="outline" onClick={copyLink} className="gap-2 sm:w-40">
                        <Copy className="h-4 w-4" />
                        {copied ? t('copied') : t('copyLink')}
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t('affiliateLinkHint')}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-background/55 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Correo de PayPal</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {affiliatePaypalEmail || 'Aún no has guardado un correo de pago.'}
                      </p>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="paypal-email">Actualizar correo</Label>
                        <Input
                          id="paypal-email"
                          type="email"
                          placeholder="tu-correo@paypal.com"
                          value={paypalEmail}
                          onChange={event => setPaypalEmail(event.target.value)}
                          className="bg-background/80"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          onClick={savePaypalEmail}
                          disabled={savingPaypal || !paypalEmail.trim()}
                          className="gap-2"
                        >
                          {savingPaypal ? 'Guardando...' : 'Guardar correo'}
                        </Button>
                        {paypalSaved && (
                          <span className="text-sm text-emerald-500">Correo guardado.</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background/55 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Payout</p>
                          <p className="mt-1 text-sm text-muted-foreground">Saldo disponible y mínimo de retiro.</p>
                        </div>
                        <Badge variant={affiliate.canRequestManualPayout ? 'default' : 'secondary'}>
                          {affiliate.canRequestManualPayout ? 'Listo' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border bg-background/70 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('moneyEarned')}</p>
                          <p className="mt-1 text-2xl font-bold">{money(paidRevenue)}</p>
                        </div>
                        <div className="rounded-xl border bg-background/70 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Disponible</p>
                          <p className="mt-1 text-2xl font-bold">{money(availablePayout)}</p>
                        </div>
                        <div className="rounded-xl border bg-background/70 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('conversionRate')}</p>
                          <p className="mt-1 text-2xl font-bold">{conversionRate}%</p>
                        </div>
                        <div className="rounded-xl border bg-background/70 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('clicks')}</p>
                          <p className="mt-1 text-2xl font-bold">{clicks}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border bg-background/55 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('totalTracked')}</p>
                    <p className="mt-1 text-3xl font-bold">{money(totalRevenue)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{t('summaryLine2')}</p>
                  </div>
                  <div className="rounded-2xl border bg-background/55 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Mínimo de pago</p>
                    <p className="mt-1 text-3xl font-bold">{money(payoutThreshold)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {affiliate.canRequestManualPayout ? 'Listo para pagar por PayPal o Wise.' : 'Aún no alcanza el mínimo.'}
                    </p>
                    <div className="mt-4">
                      <Progress value={Math.min(100, (availablePayout / payoutThreshold) * 100)} />
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-background/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Método</p>
                        <p className="mt-1 text-sm font-medium">PayPal / Wise manual</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Tu correo guardado se usa para transferencias manuales cuando el pago esté disponible.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Package className="h-5 w-5" />
                  {t('salesTitle')}
                </CardTitle>
                <CardDescription>{t('salesDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {affiliateSales.map((sale, index) => (
                    <div
                      key={`${sale.product}-${sale.date}`}
                      className="rounded-xl border bg-background/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{sale.product}</p>
                          <p className="text-xs text-muted-foreground">{sale.date}</p>
                        </div>
                        <Badge variant={sale.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                          {sale.status}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{t('saleAmount')}</span>
                        <span className="font-semibold">{money(sale.amount)}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all',
                            index === 0 ? 'w-[82%]' : index === 1 ? 'w-[64%]' : index === 2 ? 'w-[47%]' : 'w-[91%]'
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <LineChart className="h-5 w-5" />
                    {t('performanceTitle')}
                  </CardTitle>
                  <CardDescription>{t('performanceDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {topProducts.map(item => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                        <Progress value={item.value * 2} />
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('totalTracked')}</span>
                    <span className="font-semibold">{affiliate.salesRegistered}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('currentPlan')}</span>
                    <span className="font-semibold capitalize">{plan}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('stripeStatus')}</span>
                    <span className="font-semibold capitalize">{status ?? 'free'}</span>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ingresos históricos</p>
                        <p className="text-xs text-muted-foreground">
                          Vista {chartMode === 'day' ? 'diaria' : 'semanal'} de ingresos y comisiones basada en MongoDB.
                        </p>
                      </div>
                      <div className="flex rounded-full border bg-background/60 p-1 text-xs">
                        <Button
                          type="button"
                          size="sm"
                          variant={chartMode === 'day' ? 'default' : 'ghost'}
                          className="h-8 rounded-full px-3"
                          onClick={() => setChartMode('day')}
                        >
                          Día
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={chartMode === 'week' ? 'default' : 'ghost'}
                          className="h-8 rounded-full px-3"
                          onClick={() => setChartMode('week')}
                        >
                          Semana
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" />
                        Ingresos
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400" />
                        Comisiones
                      </span>
                    </div>
                    <div className="relative flex items-end gap-2 h-32 rounded-2xl border bg-background/40 px-3 py-4 overflow-hidden">
                      {chartPoints.length > 1 && (
                        <svg
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 h-full w-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="affiliateTrendLine" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#22d3ee" />
                              <stop offset="50%" stopColor="#60a5fa" />
                              <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                          </defs>
                          <path
                            d={chartLinePath}
                            fill="none"
                            stroke="url(#affiliateTrendLine)"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          <path
                            d={commissionLinePath}
                            fill="none"
                            stroke="url(#affiliateCommissionLine)"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="4 2"
                            vectorEffect="non-scaling-stroke"
                          />
                          <defs>
                            <linearGradient id="affiliateCommissionLine" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#d946ef" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                          {chartPoints.map((point, index) => (
                            <circle
                              key={`${chartMode}-trend-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r="1.6"
                              fill="#e0f2fe"
                              stroke="#22d3ee"
                              strokeWidth="0.6"
                            />
                          ))}
                          {commissionPoints.map((point, index) => (
                            <circle
                              key={`${chartMode}-commission-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r="1.5"
                              fill="#fde68a"
                              stroke="#d946ef"
                              strokeWidth="0.55"
                            />
                          ))}
                        </svg>
                      )}
                      {chartSeries.map(item => {
                        const height = Math.max(14, Math.round((item.revenueCents / chartMax) * 100));
                        return (
                          <div key={`${chartMode}-${item.label}`} className="flex-1 space-y-2 text-center">
                            <div className="relative mx-auto flex h-24 w-full max-w-10 items-end rounded-full bg-muted/50 p-1">
                              <div
                                className="w-full rounded-full bg-gradient-to-t from-cyan-500 via-blue-500 to-emerald-400 shadow-[0_0_18px_rgba(34,211,238,0.28)] transition-all"
                                style={{ height: `${height}%` }}
                                title={`${item.label}: ${money(item.revenueCents / 100)}`}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                            <p className="text-[10px] font-medium">{money(item.revenueCents / 100)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="h-5 w-5" />
                    {t('affiliateSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{t('summaryLine1')}</p>
                  <p>{t('summaryLine2')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
