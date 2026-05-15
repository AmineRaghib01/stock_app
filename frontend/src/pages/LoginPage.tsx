import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Factory, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function LoginPage() {
  const { login, token, isReady } = useAuth();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isReady && token) {
    return <Navigate to={loc.state?.from || '/'} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion réussie');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f130d] p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c8f3a33,transparent_35%),radial-gradient(circle_at_bottom_right,#3f4f24aa,transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:42px_42px] opacity-20" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#556b2f] via-[#34421f] to-[#151a10] p-10 text-white md:flex">
          <div>
            <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg">
              <Factory className="size-7" />
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight">
              Sage Automotive Interiors
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
              Plateforme interne de gestion de stock, suivi des opérations et pilotage des flux industriels.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <div className="mb-3 flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#d7e89b]" />
              <p className="font-medium">Accès sécurisé</p>
            </div>
            <p className="text-sm leading-6 text-white/70">
              Connexion réservée aux utilisateurs autorisés de l’entreprise.
            </p>
          </div>
        </div>

        <div className="bg-[#f7f8f2] p-8 md:p-12">
          <div className="mb-8 md:hidden">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#556b2f] text-white">
              <Factory className="size-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#1f2718]">Sage Automotive Interiors</h1>
          </div>

          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-0">
              <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#6b7d3b]">
                  Espace interne
                </p>
                <h2 className="mt-3 text-3xl font-bold text-[#1f2718]">
                  Connexion
                </h2>
                <p className="mt-2 text-sm text-[#68705c]">
                  Entrez vos identifiants pour accéder au tableau de bord.
                </p>
              </div>

              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2d351f]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-[#d8ddc8] bg-white focus-visible:ring-[#6b7d3b]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2d351f]">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-[#d8ddc8] bg-white focus-visible:ring-[#6b7d3b]"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#556b2f] font-semibold text-white shadow-lg shadow-[#556b2f]/25 transition hover:bg-[#465827]"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours…' : 'Se connecter'}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-[#7b8370]">
                © Sage Automotive Interiors — Internal Stock Management System
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}