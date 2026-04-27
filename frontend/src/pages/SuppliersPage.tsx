import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { suppliersApi } from '@/services/endpoints';
import type { Supplier } from '@/types';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SuppliersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => (await suppliersApi.list({ limit: 50 })).data,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => suppliersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fournisseur cree');
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Fournisseurs"
        description="Donnees fournisseurs pour les achats et la conformite."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nouveau fournisseur
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Societe</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telephone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s: Supplier) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.companyName ?? '—'}</TableCell>
              <TableCell>{s.email ?? '—'}</TableCell>
              <TableCell>{s.phone ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen} title="Nouveau fournisseur">
        <SupplierForm onSubmit={(b) => create.mutate(b)} loading={create.isPending} onCancel={() => setOpen(false)} />
      </Dialog>
    </div>
  );
}

function SupplierForm({
  onSubmit,
  loading,
  onCancel,
}: {
  onSubmit: (b: Record<string, unknown>) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: form.name,
          companyName: form.companyName || null,
          email: form.email || null,
          phone: form.phone || null,
          address: form.address || null,
          notes: form.notes || null,
        });
      }}
    >
      <div className="sm:col-span-2">
        <Label>Nom</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="sm:col-span-2">
        <Label>Societe</Label>
        <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <Label>Telephone</Label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <Label>Adresse</Label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <Label>Notes</Label>
        <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
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
