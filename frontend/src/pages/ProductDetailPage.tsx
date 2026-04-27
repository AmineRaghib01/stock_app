import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '@/services/endpoints';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const product = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await productsApi.get(id)).data.data,
    enabled: Boolean(id),
  });

  const update = useMutation({
    mutationFn: (body: Record<string, unknown>) => productsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', id] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit mis a jour');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = useMutation({
    mutationFn: (f: File) => productsApi.uploadImage(id, f),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Image televersee');
      setFile(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (product.isLoading || !product.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const p = product.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={p.name} description={p.sku} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                update.mutate({
                  name: String(fd.get('name')),
                  sku: String(fd.get('sku')),
                  barcode: String(fd.get('barcode') || '') || null,
                  description: String(fd.get('description') || '') || null,
                  quantity: Number(fd.get('quantity')),
                  costPrice: Number(fd.get('costPrice')),
                  sellingPrice: Number(fd.get('sellingPrice')),
                  minStockLevel: Number(fd.get('minStockLevel')),
                  unit: String(fd.get('unit')),
                  status: fd.get('status'),
                });
              }}
            >
              <div className="sm:col-span-2">
                <Label>Nom</Label>
                <Input name="name" defaultValue={p.name} required />
              </div>
              <div>
                <Label>SKU</Label>
                <Input name="sku" defaultValue={p.sku} required />
              </div>
              <div>
                <Label>Code-barres</Label>
                <Input name="barcode" defaultValue={p.barcode ?? ''} />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Input name="description" defaultValue={p.description ?? ''} />
              </div>
              <div>
                <Label>Quantite</Label>
                <Input name="quantity" type="number" defaultValue={p.quantity} />
              </div>
              <div>
                <Label>Stock min</Label>
                <Input name="minStockLevel" type="number" defaultValue={p.minStockLevel} />
              </div>
              <div>
                <Label>Cout</Label>
                <Input name="costPrice" type="number" step="0.01" defaultValue={p.costPrice} />
              </div>
              <div>
                <Label>Prix</Label>
                <Input name="sellingPrice" type="number" step="0.01" defaultValue={p.sellingPrice} />
              </div>
              <div>
                <Label>Unit</Label>
                <Input name="unit" defaultValue={p.unit} />
              </div>
              <div>
                <Label>Statut</Label>
                <select
                  name="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={p.status}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" disabled={update.isPending}>
                  Enregistrer les modifications
                </Button>
                <Badge variant="outline">{p.category?.name}</Badge>
                {p.supplier ? <Badge variant="secondary">{p.supplier.name}</Badge> : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt="" className="w-full rounded-lg border object-cover" />
            ) : (
              <p className="text-sm text-muted-foreground">Aucune image pour le moment.</p>
            )}
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Button type="button" disabled={!file || upload.isPending} onClick={() => file && upload.mutate(file)}>
              Televerser
            </Button>
            <div className="text-sm text-muted-foreground">
              <p>Vente: {formatCurrency(p.sellingPrice)}</p>
              <p>
                Etat du stock:{' '}
                {p.quantity <= p.minStockLevel ? (
                  <span className="font-medium text-amber-700">Reapprovisionnement a revoir</span>
                ) : (
                  <span className="text-emerald-700">Correct</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
