import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { ActivityLog } from '@/types';

export function ActivityPage() {
  const list = useQuery({
    queryKey: ['activity'],
    queryFn: async () => (await activityApi.list({ limit: 40 })).data,
  });

  const rows = list.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Journal d'activite" description="Trace d'audit operationnelle et liee a la securite." />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entite</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((a: ActivityLog) => (
            <TableRow key={a.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
              <TableCell>
                <div className="font-medium">
                  {a.user?.firstName} {a.user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{a.user?.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{a.action}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {a.entity ?? '—'} {a.entityId ? <span className="text-xs">({a.entityId.slice(0, 8)}…)</span> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
