import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportsApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadCsv, toCsv } from '@/lib/csv';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ReportsPage() {
  const [tab, setTab] = useState('valuation');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const range = {
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  };

  const valuation = useQuery({
    queryKey: ['report', 'valuation'],
    queryFn: async () => (await reportsApi.inventoryValuation()).data.data as Record<string, unknown>,
    enabled: tab === 'valuation',
  });

  const low = useQuery({
    queryKey: ['report', 'low'],
    queryFn: async () => (await reportsApi.lowStock()).data.data as Record<string, unknown>,
    enabled: tab === 'low',
  });

  const movements = useQuery({
    queryKey: ['report', 'movements', range],
    queryFn: async () => (await reportsApi.stockMovements(range)).data.data as Record<string, unknown>,
    enabled: tab === 'movements',
  });

  const purchases = useQuery({
    queryKey: ['report', 'purchases', range],
    queryFn: async () => (await reportsApi.purchases(range)).data.data as Record<string, unknown>,
    enabled: tab === 'purchases',
  });

  const sales = useQuery({
    queryKey: ['report', 'sales', range],
    queryFn: async () => (await reportsApi.sales(range)).data.data as Record<string, unknown>,
    enabled: tab === 'sales',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rapports"
        description="Vues operationnelles et financieres avec export CSV pour analyse."
      />

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">De</p>
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">A</p>
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="valuation">Valorisation</TabsTrigger>
          <TabsTrigger value="low">Stock bas</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="purchases">Achats</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
        </TabsList>

        <TabsContent value="valuation">
          <ReportTable
            title="Valorisation des stocks"
            loading={valuation.isLoading}
            rows={(valuation.data?.rows as Record<string, unknown>[]) ?? []}
            columns={[
              { key: 'sku', header: 'SKU' },
              { key: 'name', header: 'Name' },
              { key: 'category', header: 'Category' },
              { key: 'quantity', header: 'Qty' },
              { key: 'valueAtCost', header: 'Value (cost)' },
              { key: 'valueAtRetail', header: 'Value (retail)' },
            ]}
            onExport={() => {
              const rows = (valuation.data?.rows as Record<string, unknown>[]) ?? [];
              const csv = toCsv(rows, [
                { key: 'sku', header: 'SKU' },
                { key: 'name', header: 'Name' },
                { key: 'category', header: 'Category' },
                { key: 'quantity', header: 'Qty' },
                { key: 'valueAtCost', header: 'ValueAtCost' },
                { key: 'valueAtRetail', header: 'ValueAtRetail' },
              ]);
              downloadCsv('inventory-valuation.csv', csv);
              toast.success('Exporte');
            }}
            footer={
              valuation.data?.totals ? (
                <p className="text-sm text-muted-foreground">
                  Total au cout: {formatCurrency(Number((valuation.data.totals as Record<string, unknown>).atCost))} ·
                  a la vente: {formatCurrency(Number((valuation.data.totals as Record<string, unknown>).atRetail))}
                </p>
              ) : null
            }
          />
        </TabsContent>

        <TabsContent value="low">
          <ReportTable
            title="Stock bas"
            loading={low.isLoading}
            rows={(low.data?.rows as Record<string, unknown>[]) ?? []}
            columns={[
              { key: 'sku', header: 'SKU' },
              { key: 'name', header: 'Name' },
              { key: 'quantity', header: 'Qty' },
              { key: 'minStockLevel', header: 'Min' },
              { key: 'gap', header: 'Gap' },
            ]}
            onExport={() => {
              const rows = (low.data?.rows as Record<string, unknown>[]) ?? [];
              downloadCsv('low-stock.csv', toCsv(rows, [
                { key: 'sku', header: 'SKU' },
                { key: 'name', header: 'Name' },
                { key: 'quantity', header: 'Qty' },
                { key: 'minStockLevel', header: 'Min' },
                { key: 'gap', header: 'Gap' },
              ]));
              toast.success('Exporte');
            }}
          />
        </TabsContent>

        <TabsContent value="movements">
          <ReportTable
            title="Mouvements de stock"
            loading={movements.isLoading}
            rows={(movements.data?.rows as Record<string, unknown>[]) ?? []}
            columns={[
              { key: 'date', header: 'Date' },
              { key: 'sku', header: 'SKU' },
              { key: 'product', header: 'Produit' },
              { key: 'type', header: 'Type' },
              { key: 'quantity', header: 'Qty' },
              { key: 'reference', header: 'Ref' },
            ]}
            onExport={() => {
              const rows = (movements.data?.rows as Record<string, unknown>[]) ?? [];
              downloadCsv('stock-movements.csv', toCsv(rows, [
                { key: 'date', header: 'Date' },
                { key: 'sku', header: 'SKU' },
                { key: 'product', header: 'Produit' },
                { key: 'type', header: 'Type' },
                { key: 'quantity', header: 'Qty' },
                { key: 'reference', header: 'Ref' },
              ]));
              toast.success('Exporte');
            }}
          />
        </TabsContent>

        <TabsContent value="purchases">
          <ReportTable
            title="Achats"
            loading={purchases.isLoading}
            rows={(purchases.data?.rows as Record<string, unknown>[]) ?? []}
            columns={[
              { key: 'reference', header: 'Ref' },
              { key: 'date', header: 'Date' },
              { key: 'supplier', header: 'Fournisseur' },
              { key: 'status', header: 'Statut' },
              { key: 'total', header: 'Total' },
            ]}
            onExport={() => {
              const rows = (purchases.data?.rows as Record<string, unknown>[]) ?? [];
              downloadCsv('purchases.csv', toCsv(rows, [
                { key: 'reference', header: 'Ref' },
                { key: 'date', header: 'Date' },
                { key: 'supplier', header: 'Fournisseur' },
                { key: 'status', header: 'Statut' },
                { key: 'total', header: 'Total' },
              ]));
              toast.success('Exporte');
            }}
            footer={
              purchases.data?.totalAmount != null ? (
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(Number(purchases.data.totalAmount))}
                </p>
              ) : null
            }
          />
        </TabsContent>

        <TabsContent value="sales">
          <ReportTable
            title="Ventes"
            loading={sales.isLoading}
            rows={(sales.data?.rows as Record<string, unknown>[]) ?? []}
            columns={[
              { key: 'reference', header: 'Ref' },
              { key: 'date', header: 'Date' },
              { key: 'customer', header: 'Client' },
              { key: 'total', header: 'Total' },
            ]}
            onExport={() => {
              const rows = (sales.data?.rows as Record<string, unknown>[]) ?? [];
              downloadCsv('sales.csv', toCsv(rows, [
                { key: 'reference', header: 'Ref' },
                { key: 'date', header: 'Date' },
                { key: 'customer', header: 'Client' },
                { key: 'total', header: 'Total' },
              ]));
              toast.success('Exporte');
            }}
            footer={
              sales.data?.totalRevenue != null ? (
                <p className="text-sm text-muted-foreground">
                  Chiffre d'affaires: {formatCurrency(Number(sales.data.totalRevenue))}
                </p>
              ) : null
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportTable({
  title,
  loading,
  rows,
  columns,
  onExport,
  footer,
}: {
  title: string;
  loading: boolean;
  rows: Record<string, unknown>[];
  columns: { key: keyof Record<string, unknown>; header: string }[];
  onExport: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onExport} disabled={!rows.length}>
          Exporter CSV
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={String(c.key)}>{c.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={String(c.key)} className="max-w-[220px] truncate">
                    {formatCell(r[c.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {footer}
    </div>
  );
}

function formatCell(v: unknown) {
  if (v == null) return '—';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === 'string' && !Number.isNaN(Date.parse(v)) && v.includes('T')) return formatDate(v);
  return String(v);
}
