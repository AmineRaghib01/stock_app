import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Boxes, Layers3, TrendingUp, Truck } from 'lucide-react';
import { dashboardApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => (await dashboardApi.summary()).data.data as Record<string, unknown>,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const summary = data.summary as Record<string, number>;
  const alerts = (data.alerts as { severity: string; message: string; sku?: string; productId?: string }[]) ?? [];
  const recentMovements = (data.recentMovements as Record<string, unknown>[]) ?? [];
  const charts = data.charts as {
    stockByCategory: { name: string; value: number; units: number; color?: string | null }[];
    monthlyMovements: { month: string; type: string; qty: number }[];
  };

  const monthly = buildMonthlyChart(charts?.monthlyMovements ?? []);
  const categoryData = (charts?.stockByCategory ?? []).map((c) => ({
    name: c.name,
    value: c.value,
    units: c.units,
    fill: c.color || '#6366f1',
  }));

  const statCards = [
    { label: 'Produits actifs', value: summary.totalProducts, icon: Boxes },
    { label: 'Categories', value: summary.totalCategories, icon: Layers3 },
    { label: 'Fournisseurs', value: summary.totalSuppliers, icon: Truck },
    { label: 'SKU en stock bas', value: summary.lowStockCount, icon: AlertTriangle, warn: summary.lowStockCount > 0 },
    {
      label: 'Valeur du stock (cout)',
      value: formatCurrency(summary.totalStockValue),
      icon: TrendingUp,
      text: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Tableau de bord"
        description="Vue operationnelle de la sante du stock, du rythme des mouvements et des alertes de risque."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label} className={s.warn ? 'border-amber-300/80' : undefined}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`font-display text-2xl font-semibold ${s.warn ? 'text-amber-700' : ''}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length ? (
        <Card className="border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <Badge key={i} variant={a.severity === 'critical' ? 'destructive' : 'warning'}>
                {a.message}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Valeur du stock par categorie</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mouvements de stock (6 mois)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="IN" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="OUT" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ADJUSTMENT" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Derniers mouvements de stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements.map((m) => {
                const product = m.product as { name?: string; sku?: string } | undefined;
                const user = m.performedBy as { firstName?: string; lastName?: string } | undefined;
                return (
                  <TableRow key={String(m.id)}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(String(m.createdAt))}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product?.name}</div>
                      <div className="text-xs text-muted-foreground">{product?.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{String(m.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{String(m.quantity)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user?.firstName} {user?.lastName}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!recentMovements.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun mouvement pour le moment.</p>
          ) : null}
          <div className="mt-4 text-right">
            <Link to="/stock-movements" className="text-sm font-medium text-primary hover:underline">
              Voir tous les mouvements →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildMonthlyChart(rows: { month: string; type: string; qty: number }[]) {
  const map = new Map<string, { IN: number; OUT: number; ADJUSTMENT: number; label: string }>();
  for (const r of rows) {
    const key = new Date(r.month).toISOString().slice(0, 7);
    const label = new Date(r.month).toLocaleString(undefined, { month: 'short', year: 'numeric' });
    if (!map.has(key)) map.set(key, { IN: 0, OUT: 0, ADJUSTMENT: 0, label });
    const b = map.get(key)!;
    if (r.type === 'IN') b.IN += r.qty;
    else if (r.type === 'OUT') b.OUT += r.qty;
    else b.ADJUSTMENT += r.qty;
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v }));
}
