'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackAnalyticsEvent } from '@/lib/analytics';

const TOPICS = [
  ['product_updates', 'Product updates'],
  ['tutorials', 'Tutorials and workflows'],
  ['offers', 'Offers and promotions'],
] as const;

export default function EmailPreferencesForm({ initialOptIn, initialTopics }: { initialOptIn: boolean; initialTopics: string[] }) {
  const [marketingOptIn, setMarketingOptIn] = useState(initialOptIn);
  const [topics, setTopics] = useState<string[]>(initialTopics);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  function toggleTopic(topic: string) {
    setTopics(current => current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic]);
  }

  async function save() {
    setStatus('saving');
    try {
      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketingOptIn, topics }),
      });
      if (!response.ok) throw new Error('Preference update failed');

      trackAnalyticsEvent('marketing_consent_updated', {
        consent_granted: marketingOptIn,
        consent_source: 'dashboard_settings',
        topic_count: topics.length,
      });
      if (marketingOptIn && !initialOptIn) {
        trackAnalyticsEvent('newsletter_signup', { consent_source: 'dashboard_settings' });
      }
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email preferences</CardTitle>
        <CardDescription>
          Your account email does not subscribe you to marketing. Choose whether Prompt Studio may send promotional email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={marketingOptIn} onChange={event => setMarketingOptIn(event.target.checked)} className="mt-1" />
          <span>
            <span className="block font-medium">Marketing emails</span>
            <span className="block text-sm text-muted-foreground">Receive product news, tutorials and eligible offers. You can opt out here at any time.</span>
          </span>
        </label>
        <fieldset className="space-y-2" disabled={!marketingOptIn}>
          <legend className="text-sm font-medium">Topics</legend>
          {TOPICS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={topics.includes(value)} onChange={() => toggleTopic(value)} />
              {label}
            </label>
          ))}
        </fieldset>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={save} disabled={status === 'saving'}>{status === 'saving' ? 'Saving…' : 'Save email preferences'}</Button>
          {status === 'saved' ? <span className="text-sm text-muted-foreground">Saved.</span> : null}
          {status === 'error' ? <span className="text-sm text-destructive">Could not save preferences.</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
