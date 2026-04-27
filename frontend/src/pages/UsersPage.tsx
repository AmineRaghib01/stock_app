import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/services/endpoints';
import type { User } from '@/types';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function UsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersApi.list({ limit: 50 })).data,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => usersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur invite');
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => usersApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Utilisateurs"
        description="Controle administratif des acces et des roles."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            Ajouter un utilisateur
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u: User) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">
                {u.firstName} {u.lastName}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{u.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={u.status === 'ACTIVE' ? 'success' : 'secondary'}>{u.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggle.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
                  }
                >
                  {u.status === 'ACTIVE' ? 'Desactiver' : 'Activer'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen} title="Creer un utilisateur">
        <UserForm onSubmit={(b) => create.mutate(b)} loading={create.isPending} onCancel={() => setOpen(false)} />
      </Dialog>
    </div>
  );
}

function UserForm({
  onSubmit,
  loading,
  onCancel,
}: {
  onSubmit: (b: Record<string, unknown>) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STAFF',
  });
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="sm:col-span-2">
        <Label>Email</Label>
        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
      </div>
      <div className="sm:col-span-2">
        <Label>Mot de passe</Label>
        <Input
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          type="password"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label>Prenom</Label>
        <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
      </div>
      <div>
        <Label>Nom de famille</Label>
        <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
      </div>
      <div className="sm:col-span-2">
        <Label>Role</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="STAFF">STAFF</option>
          <option value="MANAGER">MANAGER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
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
