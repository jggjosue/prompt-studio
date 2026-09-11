'use client';

import { useMemo, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock3 } from 'lucide-react';

type AffiliateApplication = {
  _id: string;
  fullName: string;
  email: string;
  profile: string;
  audience: string;
  channel: string;
  experience: string;
  tier: string;
  plan: string;
  message: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialApplications: AffiliateApplication[];
};

export default function AffiliateApplicationsClient({ initialApplications }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'rejected'>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    return applications.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, reviewed: 0, approved: 0, rejected: 0 }
    );
  }, [applications]);

  const visibleApplications = filter === 'all' ? applications : applications.filter(item => item.status === filter);

  async function updateStatus(applicationId: string, status: AffiliateApplication['status']) {
    setPendingId(applicationId);
    try {
      const response = await fetch(`/api/admin/affiliate-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('No se pudo actualizar la solicitud.');
      }
      const payload = (await response.json()) as { applicationId: string; status: AffiliateApplication['status'] };
      startTransition(() => {
        setApplications(prev =>
          prev.map(item => (item._id === payload.applicationId ? { ...item, status: payload.status, updatedAt: new Date().toISOString() } : item))
        );
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setFilter('pending')}
        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-[0_18px_50px_rgba(37,99,235,0.16)]"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-blue-400 transition-transform duration-300 group-hover:scale-105">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
              Resumen rápido
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Solicitudes pendientes de revisión
            </span>
          </span>
        </span>
        <Badge className="min-w-11 justify-center rounded-full bg-blue-600 px-3 py-1.5 text-base text-white hover:bg-blue-600">
          {counts.pending}
        </Badge>
      </button>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total', counts.total],
          ['Pendientes', counts.pending],
          ['Revisadas', counts.reviewed],
          ['Aprobadas', counts.approved],
          ['Rechazadas', counts.rejected],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'reviewed', 'approved', 'rejected'] as const).map(option => (
          <Button
            key={option}
            type="button"
            variant={filter === option ? 'default' : 'outline'}
            onClick={() => setFilter(option)}
            className="capitalize"
          >
            {option === 'all' ? 'Todas' : option}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Creada</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map(application => (
                <tr key={application._id} className="border-b last:border-b-0 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(application.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">
                    <div>{application.fullName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{application.experience || 'Sin experiencia detallada'}</div>
                  </td>
                  <td className="px-4 py-3">{application.email}</td>
                  <td className="px-4 py-3 max-w-56 break-all">{application.profile}</td>
                  <td className="px-4 py-3">
                    <div>{application.channel}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{application.audience || 'Audiencia no indicada'}</div>
                  </td>
                  <td className="px-4 py-3">{application.tier}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        application.status === 'approved'
                          ? 'default'
                          : application.status === 'rejected'
                            ? 'destructive'
                            : application.status === 'reviewed'
                              ? 'secondary'
                              : 'outline'
                      }
                      className="capitalize"
                    >
                      {application.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isPending || pendingId === application._id || application.status === 'approved'}
                        onClick={() => void updateStatus(application._id, 'approved')}
                      >
                        Aprobar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending || pendingId === application._id || application.status === 'rejected'}
                        onClick={() => void updateStatus(application._id, 'rejected')}
                      >
                        Rechazar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isPending || pendingId === application._id || application.status === 'reviewed'}
                        onClick={() => void updateStatus(application._id, 'reviewed')}
                      >
                        Revisar
                      </Button>
                    </div>
                    <p className={cn('mt-2 text-xs text-muted-foreground', application.message ? 'max-w-64 whitespace-pre-wrap' : '')}>
                      {application.message || '—'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
