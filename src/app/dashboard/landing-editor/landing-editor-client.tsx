'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ReadabilityBadge } from '@/components/readability-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useToast } from '@/hooks/use-toast';
import {
  analyzeReadability,
  type ReadabilityLocale,
} from '@/lib/readability-analysis';
import type { LandingReadabilitySnapshot } from '@/lib/landing-readability-store';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CatalogItem = {
  id: string;
  title: string;
  demoUrl: string;
};

export function LandingEditorClient() {
  const t = useTranslations('landingEditor');
  const tRead = useTranslations('readability');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pageFromUrl = searchParams.get('page')?.trim() ?? '';

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [pageId, setPageId] = useState('');
  const [locale, setLocale] = useState<ReadabilityLocale>('es');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [html, setHtml] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [savedSnapshot, setSavedSnapshot] =
    useState<LandingReadabilitySnapshot | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);

  const debouncedText = useDebouncedValue(text, 400);
  const debouncedHtml = useDebouncedValue(html, 400);

  const liveReport = useMemo(
    () =>
      debouncedText.trim()
        ? analyzeReadability({
            text: debouncedText,
            html: debouncedHtml,
            locale,
            focusKeyword: focusKeyword.trim() || undefined,
          })
        : null,
    [debouncedText, debouncedHtml, locale, focusKeyword]
  );

  useEffect(() => {
    fetch('/api/landing-pages/catalog?locale=es')
      .then(r => r.json())
      .then((data: { items: CatalogItem[] }) => {
        const items = data.items ?? [];
        setCatalog(items);
        const preferred =
          pageFromUrl && items.some(i => i.id === pageFromUrl)
            ? pageFromUrl
            : items[0]?.id;
        if (preferred) setPageId(preferred);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: t('loadCatalogError') });
      });
  }, [pageFromUrl, t, toast]);

  const loadPageContent = useCallback(async () => {
    if (!pageId) return;
    setLoadingContent(true);
    try {
      const [contentRes, snapRes] = await Promise.all([
        fetch(
          `/api/landing-pages/${pageId}/content?locale=${locale}&html=1`
        ),
        fetch(`/api/landing-pages/${pageId}/readability?locale=${locale}`),
      ]);

      if (contentRes.ok) {
        const content = await contentRes.json();
        setTitle(content.title ?? '');
        setText(content.description ?? '');
        setHtml(content.html ?? '');
      }

      if (snapRes.ok) {
        const { snapshot } = await snapRes.json();
        setSavedSnapshot(snapshot ?? null);
      } else {
        setSavedSnapshot(null);
      }
    } catch {
      toast({ variant: 'destructive', title: t('loadPageError') });
    } finally {
      setLoadingContent(false);
    }
  }, [pageId, locale, t, toast]);

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  const handleSave = async () => {
    if (!pageId || !text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${pageId}/readability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          text,
          html,
          focusKeyword: focusKeyword.trim() || undefined,
          title,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? t('saveError'));
      }
      if (data.snapshot) {
        setSavedSnapshot(data.snapshot as LandingReadabilitySnapshot);
      } else if (liveReport) {
        setSavedSnapshot({
          pageId,
          locale,
          updatedAt: new Date().toISOString(),
          wordCount: liveReport.wordCount,
          overallScore: liveReport.overallScore,
          grade: liveReport.grade,
          readingEase: liveReport.readingEase,
          gradeLevel: liveReport.gradeLevel,
          headingScore: liveReport.headingScore,
          avgWordsPerSentence: liveReport.avgWordsPerSentence,
          tips: liveReport.tips,
          report: liveReport,
        });
      }
      toast({
        title: t('saveSuccess'),
        description: t('saveSuccessDesc', {
          score: data.snapshot?.overallScore ?? 0,
        }),
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('saveError'),
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{t('editorCardTitle')}</CardTitle>
                <CardDescription>{t('editorCardDesc')}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {liveReport ? <ReadabilityBadge report={liveReport} /> : null}
                {savedSnapshot?.report ? (
                  <ReadabilityBadge
                    report={savedSnapshot.report}
                    compact
                    savedAt={savedSnapshot.updatedAt}
                    className="opacity-80"
                  />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('selectPage')}</Label>
                  <Select value={pageId} onValueChange={setPageId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectPagePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tRead('localeLabel')}</Label>
                  <Select
                    value={locale}
                    onValueChange={v => setLocale(v as ReadabilityLocale)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">ES (Fernández-Huerta)</SelectItem>
                      <SelectItem value="en">EN (Flesch-Kincaid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focus-kw">{tRead('focusKeyword')}</Label>
                <input
                  id="focus-kw"
                  type="text"
                  value={focusKeyword}
                  onChange={e => setFocusKeyword(e.target.value)}
                  placeholder={tRead('focusKeywordPlaceholder')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                />
              </div>

              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="landing-title">{t('titleLabel')}</Label>
                    <input
                      id="landing-title"
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landing-body">{tRead('bodyLabel')}</Label>
                    <Textarea
                      id="landing-body"
                      value={text}
                      onChange={e => setText(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  {html ? (
                    <p className="text-xs text-muted-foreground">
                      {t('htmlLoaded', { chars: html.length })}
                    </p>
                  ) : null}
                </>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !text.trim() || loadingContent}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t('saveWithAnalysis')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadPageContent}
                  disabled={loadingContent}
                >
                  {t('reload')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
