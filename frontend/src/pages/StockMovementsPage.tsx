import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stockApi, productsApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { StockMovementType } from '@/types';

export function StockMovementsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string | undefined>();

  const params = useMemo(() => ({ limit: 25, type }), [type]);

  const list = useQuery({
    queryKey: ['stock-movements', params],
    queryFn: async () => (await stockApi.list(params)).data,
  });

  const products = useQuery({
    queryKey: ['products', 'all-short'],
    queryFn: async () => (await productsApi.list({ limit: 100 })).data.data,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => stockApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-movements'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Mouvement enregistre');
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mouvements de stock"
        description="Journal immuable des entrees, sorties et ajustements."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            Enregistrer un mouvement
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {['ALL', 'IN', 'OUT', 'ADJUSTMENT'].map((t) => (
          <Button
            key={t}
            type="button"
            size="sm"
            variant={t === 'ALL' ? (!type ? 'default' : 'outline') : type === t ? 'default' : 'outline'}
            onClick={() => setType(t === 'ALL' ? undefined : t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Par</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(m.createdAt)}</TableCell>
              <TableCell>
                <div className="font-medium">{m.product?.name}</div>
                <div className="text-xs text-muted-foreground">{m.product?.sku}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{m.type}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{m.quantity}</TableCell>
              <TableCell>{m.reference ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">
                {m.performedBy?.firstName} {m.performedBy?.lastName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen} title="Enregistrer un mouvement de stock">
        <MovementForm
          products={products.data ?? []}
          onSubmit={(b) => create.mutate(b)}
          loading={create.isPending}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}

function MovementForm({
  products,
  onSubmit,
  loading,
  onCancel,
}: {
  products: { id: string; name: string; sku: string }[];
  onSubmit: (b: Record<string, unknown>) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<StockMovementType>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          productId,
          type,
          quantity: type === 'OUT' ? Math.abs(quantity) : quantity,
          reason: reason || null,
          reference: reference || null,
        });
      }}
    >
      <div>
        <Label>Produit</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">Selectionner…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Type</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as StockMovementType)}
        >
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
          <option value="ADJUSTMENT">ADJUSTMENT</option>
        </select>
      </div>
      <div>
        <Label>Quantite {type === 'ADJUSTMENT' ? '(utilisez une valeur negative pour diminuer)' : ''}</Label>
        <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
      </div>
      <div>
        <Label>Raison</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div>
        <Label>Reference</Label>
        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
