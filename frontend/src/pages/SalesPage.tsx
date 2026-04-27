import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesApi, productsApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

export function SalesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['sales'],
    queryFn: async () => (await salesApi.list({ limit: 30 })).data,
  });

  const rows = list.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Ventes"
        description="Sorties de stock avec deduction automatique de l'inventaire."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            Nouvelle vente
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s: Sale) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.reference ?? s.id.slice(0, 8)}</TableCell>
              <TableCell>{s.customerName ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(s.saleDate)}</TableCell>
              <TableCell className="text-right">{formatCurrency(s.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SaleDialog
        open={open}
        onOpenChange={setOpen}
        onDone={() => {
          qc.invalidateQueries({ queryKey: ['sales'] });
          qc.invalidateQueries({ queryKey: ['products'] });
          qc.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}

function SaleDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const products = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => (await productsApi.list({ limit: 200 })).data.data,
    enabled: open,
  });

  const [customerName, setCustomerName] = useState('');
  const [reference, setReference] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);

  const create = useMutation({
    mutationFn: () =>
      salesApi.create({
        customerName: customerName || null,
        reference: reference || null,
        items: items
          .filter((i) => i.productId)
          .map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
          })),
      }),
    onSuccess: () => {
      toast.success('Vente enregistree');
      onDone();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Nouvelle vente / sortie de stock">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Client (optionnel)</Label>
            <input
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <Label>Reference</Label>
            <input
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Lignes</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])}
            >
              <Plus className="size-4" />
              Ajouter une ligne
            </Button>
          </div>
          {items.map((line, idx) => (
            <div key={idx} className="grid gap-2 rounded-lg border p-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={line.productId}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].productId = e.target.value;
                    const p = (products.data ?? []).find((x: { id: string }) => x.id === e.target.value) as
                      | { sellingPrice: number }
                      | undefined;
                    if (p) next[idx].unitPrice = p.sellingPrice;
                    setItems(next);
                  }}
                >
                  <option value="">Produit…</option>
                  {(products.data ?? []).map((p: { id: string; name: string }) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={line.quantity}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].quantity = Number(e.target.value);
                    setItems(next);
                  }}
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="number"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={line.unitPrice}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].unitPrice = Number(e.target.value);
                    setItems(next);
                  }}
                />
              </div>
              <div className="flex items-center justify-end md:col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={create.isPending}>
            Creer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
