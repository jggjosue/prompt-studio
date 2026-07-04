'use client';

import * as React from 'react';
import { ReactNode, cloneElement, isValidElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

type FreeEmailGateProps = {
  children: ReactNode;
  title: string;
  description: string;
  submitText: string;
  onSuccess: () => void;
};

export function FreeEmailGate({
  children,
  title,
  description,
  submitText,
  onSuccess,
}: FreeEmailGateProps) {
  const t = useTranslations('common');
  const { user } = useUser();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [hasSavedEmail, setHasSavedEmail] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !email) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user, email]);

  React.useEffect(() => {
    if (localStorage.getItem('prompt_studio_free_email_saved')) {
      setHasSavedEmail(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: t('invalidEmail'),
        description: t('invalidEmailDescription'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/new-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      localStorage.setItem('prompt_studio_free_email_saved', 'true');
      setHasSavedEmail(true);

      if (!res.ok) {
        console.error('Failed to save email, but proceeding');
      }

      setOpen(false);
      // Let Radix finish closing this dialog before an action opens another
      // dialog (the prompt viewer) or starts a download.
      window.setTimeout(onSuccess, 0);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('connectionError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const trigger = isValidElement(children) ? (
    (() => {
    const childElement = children as React.ReactElement<any>;
    return cloneElement(childElement, {
      onClick: (e: React.MouseEvent) => {
        if (childElement.props.onClick) {
          childElement.props.onClick(e);
        }
        if (e.defaultPrevented) return;

        e.preventDefault();
        if (hasSavedEmail) {
          onSuccess();
        } else {
          setOpen(true);
        }
      }
    });
    })()
  ) : (
    children
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              autoFocus
            />
            <div className="flex items-center gap-2 px-1 text-sm">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-slate-900 border-white/10 cursor-pointer"
              />
              <label htmlFor="accept-terms" className="text-muted-foreground select-none cursor-pointer">
                {t('acceptTerms')}{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  {t('termsAndServices')}
                </a>
              </label>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit" disabled={loading || !acceptedTerms} className="w-full !bg-blue-600 !text-white hover:!bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t('processing') : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
