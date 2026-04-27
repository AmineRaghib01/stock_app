import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/services/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      password: '',
    });
  }, [user]);

  const save = useMutation({
    mutationFn: () =>
      authApi.profile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
        ...(form.password ? { password: form.password } : {}),
      }),
    onSuccess: async () => {
      toast.success('Profil mis a jour');
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Profil" description="Gerez votre identite et vos preferences de securite." />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{user.role}</Badge>
            <Badge variant="secondary">{user.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Prenom</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <Label>Nom de famille</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Telephone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Nouveau mot de passe (optionnel)</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 caracteres"
              />
            </div>
          </div>
          <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
            Enregistrer les modifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
