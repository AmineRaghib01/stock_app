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
import { AlertTriangle, Boxes, Factory, Layers3, TrendingUp, Truck } from 'lucide-react';
import { dashboardApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

const olive = {
  main: '#556b2f',
  dark: '#1f2718',
  soft: '#f7f8f2',
  border: '#d8ddc8',
};

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => (await dashboardApi.summary()).data.data as Record<string, unknown>,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6 rounded-3xl bg-[#f7f8f2] p-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
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
    fill: c.color || olive.main,
  }));

  const statCards = [
    { label: 'Produits actifs', value: summary.totalProducts, icon: Boxes },
    { label: 'Catégories', value: summary.totalCategories, icon: Layers3 },
    { label: 'Fournisseurs', value: summary.totalSuppliers, icon: Truck },
    { label: 'SKU en stock bas', value: summary.lowStockCount, icon: AlertTriangle, warn: summary.lowStockCount > 0 },
    {
      label: 'Valeur du stock',
      value: formatCurrency(summary.totalStockValue),
      icon: TrendingUp,
      text: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in rounded-3xl bg-[#f7f8f2] p-6">
      <div className="rounded-[2rem] border border-[#d8ddc8] bg-gradient-to-br from-[#1f2718] via-[#34421f] to-[#556b2f] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                <Factory className="size-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/60">Sage Automotive Interiors</p>
                <h1 className="text-3xl font-bold">Tableau de bord opérationnel</h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-white/70">
              Suivi du stock, des mouvements, des fournisseurs et des alertes critiques en temps réel.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">État système</p>
            <p className="mt-1 text-lg font-semibold">StockFlow actif</p>
          </div>
        </div>
      </div>

      <PageHeader
        title="Vue globale"
        description="Indicateurs clés pour le pilotage industriel et la maîtrise des flux."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className={`border-[#d8ddc8] bg-white/85 shadow-md backdrop-blur transition hover:-translate-y-1 hover:shadow-xl ${
              s.warn ? 'border-[#b7791f]' : ''
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-[#5f6753]">{s.label}</CardTitle>
              <div className={`rounded-xl p-2 ${s.warn ? 'bg-amber-100 text-amber-700' : 'bg-[#eef2df] text-[#556b2f]'}`}>
                <s.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`font-display text-3xl font-bold tracking-tight ${s.warn ? 'text-amber-700' : 'text-[#1f2718]'}`}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length ? (
        <Card className="border-[#d8ddc8] bg-[#f3f5ea] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#1f2718]">
              <AlertTriangle className="size-4 text-[#556b2f]" />
              Alertes de stock
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
        <Card className="border-[#d8ddc8] bg-white/90 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#1f2718]">Valeur du stock par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ddc8" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#d8ddc8] bg-white/90 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#1f2718]">Mouvements de stock — 6 mois</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ddc8" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="IN" stackId="a" fill="#6b7d3b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="OUT" stackId="a" fill="#a3b18a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ADJUSTMENT" stackId="a" fill="#34421f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#d8ddc8] bg-white/90 shadow-md">
        <CardHeader>
          <CardTitle className="text-[#1f2718]">Derniers mouvements de stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-[#e3e7d3]">
            <Table>
              <TableHeader className="bg-[#eef2df]">
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
                    <TableRow key={String(m.id)} className="hover:bg-[#f7f8f2]">
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(String(m.createdAt))}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#1f2718]">{product?.name}</div>
                        <div className="text-xs text-muted-foreground">{product?.sku}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#b8c29a] text-[#556b2f]">
                          {String(m.type)}
                        </Badge>
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
          </div>

          {!recentMovements.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun mouvement pour le moment.</p>
          ) : null}

          <div className="mt-5 text-right">
            <Link to="/stock-movements" className="text-sm font-semibold text-[#556b2f] hover:underline">
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