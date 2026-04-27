import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { productsApi, categoriesApi, suppliersApi } from '@/services/endpoints';
import type { Product } from '@/types';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/app/EmptyState';
import { formatCurrency } from '@/lib/utils';

export function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lowStock, setLowStock] = useState(false);
  const [open, setOpen] = useState(false);

  const params = useMemo(
    () => ({ page, limit: 12, search: search || undefined, lowStock: lowStock || undefined, sortBy: 'createdAt' as const }),
    [page, search, lowStock]
  );

  const list = useQuery({
    queryKey: ['products', params],
    queryFn: async () => (await productsApi.list(params)).data,
  });

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoriesApi.list()).data.data,
  });

  const suppliers = useQuery({
    queryKey: ['suppliers', 'short'],
    queryFn: async () => (await suppliersApi.list({ limit: 100 })).data.data,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => productsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit cree');
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Produits"
        description="Recherchez, filtrez et gerez votre catalogue avec rigueur SKU."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nouveau produit
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher nom, SKU, code-barres…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
          Stock bas uniquement
        </label>
      </div>

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Aucun produit trouve" description="Ajustez les filtres ou creez un nouveau produit." />
      ) : (
        <div className="rounded-xl border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p: Product) => {
                const critical = p.quantity <= p.minStockLevel;
                return (
                  <TableRow key={p.id} className={critical ? 'bg-amber-50/50 dark:bg-amber-950/10' : undefined}>
                    <TableCell>
                      <Link to={`/products/${p.id}`} className="font-medium text-primary hover:underline">
                        {p.name}
                      </Link>
                      {critical ? (
                        <Badge variant="warning" className="ml-2">
                          Bas
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>{p.category?.name ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.quantity} {p.unit}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.sellingPrice)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-center gap-2">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Precedent
          </Button>
          <span className="px-3 py-2 text-sm text-muted-foreground">
            Page {meta.page} / {meta.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      ) : null}

      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories.data ?? []}
        suppliers={suppliers.data ?? []}
        onSubmit={(f) => create.mutate(f)}
        loading={create.isPending}
      />
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  categories,
  suppliers,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    minStockLevel: 0,
    unit: 'pcs',
    status: 'ACTIVE',
    categoryId: '',
    supplierId: '',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Nouveau produit" description="Definissez les parametres du catalogue et du stock.">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            ...form,
            barcode: form.barcode || null,
            description: form.description || null,
            supplierId: form.supplierId || null,
            quantity: Number(form.quantity),
            costPrice: Number(form.costPrice),
            sellingPrice: Number(form.sellingPrice),
            minStockLevel: Number(form.minStockLevel),
          });
        }}
      >
        <div className="sm:col-span-2">
          <Label>Nom</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        </div>
        <div>
          <Label>Code-barres</Label>
          <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
        </div>
        <div>
          <Label>Categorie</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">Selectionner…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Fournisseur</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          >
            <option value="">Aucun</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Quantite</Label>
          <Input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Stock min</Label>
          <Input
            type="number"
            value={form.minStockLevel}
            onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Cout</Label>
          <Input
            type="number"
            step="0.01"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Prix</Label>
          <Input
            type="number"
            step="0.01"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
        <div>
          <Label>Statut</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Creer'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
