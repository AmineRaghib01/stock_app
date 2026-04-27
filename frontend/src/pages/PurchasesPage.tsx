import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchasesApi, suppliersApi, productsApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Purchase } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

export function PurchasesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => (await purchasesApi.list({ limit: 30 })).data,
  });

  const rows = list.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Achats"
        description="Cycle d'approvisionnement avec reception qui met a jour le stock."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            Nouvel achat
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p: Purchase) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.reference ?? p.id.slice(0, 8)}</TableCell>
              <TableCell>{p.supplier?.name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(p.orderDate)}</TableCell>
              <TableCell>
                <Badge variant={p.status === 'RECEIVED' ? 'success' : 'secondary'}>{p.status}</Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(p.totalAmount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PurchaseDialog
        open={open}
        onOpenChange={setOpen}
        onDone={() => {
          qc.invalidateQueries({ queryKey: ['purchases'] });
          qc.invalidateQueries({ queryKey: ['products'] });
          qc.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}

function PurchaseDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const suppliers = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: async () => (await suppliersApi.list({ limit: 100 })).data.data,
    enabled: open,
  });

  const products = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => (await productsApi.list({ limit: 200 })).data.data,
    enabled: open,
  });

  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [reference, setReference] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitCost: 0 }]);

  const create = useMutation({
    mutationFn: () =>
      purchasesApi.create({
        supplierId,
        status,
        reference: reference || null,
        items: items.filter((i) => i.productId)
          .map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            unitCost: Number(i.unitCost),
          })),
      }),
    onSuccess: () => {
      toast.success('Achat cree');
      onDone();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Nouveau bon de commande">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Fournisseur</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
            >
              <option value="">Selectionner…</option>
              {(suppliers.data ?? []).map((s: { id: string; name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Statut</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING">PENDING</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
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
              onClick={() => setItems([...items, { productId: '', quantity: 1, unitCost: 0 }])}
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
                    setItems(next);
                  }}
                >
                  <option value="">Produit…</option>
                  {(products.data ?? []).map((p: { id: string; name: string; sku: string }) => (
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
                  value={line.unitCost}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].unitCost = Number(e.target.value);
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
