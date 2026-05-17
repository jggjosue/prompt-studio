'use client';

import { ProfileSubscriptionCard } from '@/components/profile-subscription-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ProfileUser = {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  picture: string | null;
};

type ProfileClientProps = {
  user: ProfileUser;
};

export default function ProfileClient({ user }: ProfileClientProps) {
  const t = useTranslations('profile');

  const displayName =
    [user.givenName, user.familyName].filter(Boolean).join(' ') ||
    user.email ||
    t('member');

  const initials =
    `${user.givenName?.[0] ?? ''}${user.familyName?.[0] ?? ''}`.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    '?';

  return (
    <div className="flex-1 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>

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
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.picture ?? undefined} alt={displayName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
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

      <ProfileSubscriptionCard />
    </div>
  );
}
