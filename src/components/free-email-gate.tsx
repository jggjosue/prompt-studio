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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

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
  const { user } = useUser();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [hasSavedEmail, setHasSavedEmail] = React.useState(false);
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
        title: 'Correo inválido',
        description: 'Por favor, ingresa un correo electrónico válido.',
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
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un problema de conexión. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (hasSavedEmail && isValidElement(children)) {
    // If the email is saved, just bypass the dialog entirely.
    // We clone the child element and attach the onSuccess handler to onClick.
    // If the child is an <a> tag with an href (like the Download button), 
    // we don't necessarily need an onClick, but for View Prompt we do.
    const childElement = children as React.ReactElement<any>;
    return cloneElement(childElement, {
      onClick: (e: React.MouseEvent) => {
        if (childElement.props.onClick) {
          childElement.props.onClick(e);
        }
        if (!e.defaultPrevented) {
          e.preventDefault();
          onSuccess();
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit" disabled={loading} className="w-full !bg-blue-600 !text-white hover:!bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Procesando...' : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
