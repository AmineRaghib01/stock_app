import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Package2,
  Settings2,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Warehouse,
  Factory,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Produits', icon: Package2 },
  { to: '/categories', label: 'Catégories', icon: Tags },
  { to: '/suppliers', label: 'Fournisseurs', icon: Truck },
  { to: '/stock-movements', label: 'Mouvements de stock', icon: Warehouse },
  { to: '/purchases', label: 'Achats', icon: ShoppingCart },
  { to: '/sales', label: 'Ventes', icon: LineChart },
  { to: '/reports', label: 'Rapports', icon: ClipboardList },
  { to: '/activity', label: "Journal d'activité", icon: Activity },
  { to: '/users', label: 'Utilisateurs', icon: Users, adminOnly: true },
  { to: '/profile', label: 'Profil', icon: Settings2 },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const links = nav.filter((n) => !(n as { adminOnly?: boolean }).adminOnly || user?.role === 'ADMIN');

  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';

  const NavItems = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={(item as { end?: boolean }).end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-[#556b2f] text-white shadow-md shadow-[#556b2f]/20'
                : 'text-[#64705a] hover:bg-[#eef2df] hover:text-[#1f2718]'
            )
          }
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f7f8f2] lg:grid lg:grid-cols-[280px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[280px] border-r border-[#d8ddc8] bg-white/95 backdrop-blur transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[#e3e7d3] px-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#556b2f] text-white shadow-md shadow-[#556b2f]/20">
            <Factory className="size-5" />
          </div>
          <div>
            <Link to="/" className="font-display text-base font-bold tracking-tight text-[#1f2718]">
              Sage Automotive
            </Link>
            <p className="text-xs font-medium text-[#6b7d3b]">Interiors Stock System</p>
          </div>
        </div>

        {NavItems}

        <div className="border-t border-[#e3e7d3] p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f8f2] px-3 py-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#556b2f] text-sm font-bold text-white">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1f2718]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-[#6b7d3b]">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-col lg:min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e3e7d3] bg-white/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:px-8">
          <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-4" />
          </Button>

          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7d3b]">Sage Automotive Interiors</p>
              <p className="text-sm text-[#64705a]">Plateforme interne de gestion de stock</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#d8ddc8] text-[#1f2718] hover:bg-[#eef2df]"
            >
              <LogOut className="size-4" />
              Déconnexion
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}