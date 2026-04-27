import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { categoriesApi } from '@/services/endpoints';
import type { Category } from '@/types';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function CategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoriesApi.list()).data.data as Category[],
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => categoriesApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categorie creee');
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categorie supprimee');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categories"
        description="Organisez la structure du catalogue et suivez l'etendue de l'assortiment."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nouvelle categorie
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(list.data ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full ring-2 ring-background"
                    style={{ background: c.color || '#94a3b8' }}
                  />
                  <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description || '—'}</p>
                <Badge variant="secondary" className="mt-3">
                  {c.productCount ?? 0} produits
                </Badge>
              </div>
              <Button type="button" variant="ghost" className="text-destructive" onClick={() => remove.mutate(c.id)}>
                Supprimer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen} title="Nouvelle categorie">
        <CategoryForm
          onSubmit={(b) => create.mutate(b)}
          loading={create.isPending}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}

function CategoryForm({
  onSubmit,
  loading,
  onCancel,
}: {
  onSubmit: (b: Record<string, unknown>) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', icon: '' });
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: form.name,
          description: form.description || null,
          color: form.color || null,
          icon: form.icon || null,
        });
      }}
    >
      <div>
        <Label>Nom</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Couleur</Label>
          <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </div>
        <div>
          <Label>Cle de l'icone</Label>
          <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="cpu" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          Creer
        </Button>
      </div>
    </form>
  );
}
