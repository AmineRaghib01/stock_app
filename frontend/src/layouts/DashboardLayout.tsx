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
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Produits', icon: Package2 },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Fournisseurs', icon: Truck },
  { to: '/stock-movements', label: 'Mouvements de stock', icon: Warehouse },
  { to: '/purchases', label: 'Achats', icon: ShoppingCart },
  { to: '/sales', label: 'Ventes', icon: LineChart },
  { to: '/reports', label: 'Rapports', icon: ClipboardList },
  { to: '/activity', label: "Journal d'activite", icon: Activity },
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
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/80'
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
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[280px] border-r bg-card/90 backdrop-blur transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package2 className="size-5" />
          </div>
          <div>
            <Link to="/" className="font-display text-base font-semibold tracking-tight">
              StockFlow
            </Link>
            <p className="text-xs text-muted-foreground">Gestion des stocks</p>
          </div>
        </div>
        {NavItems}
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Connecte en tant que</p>
            <p className="truncate text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <Badge variant="secondary" className="mt-2">
              {user?.role}
            </Badge>
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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 md:px-8">
          <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="hidden md:block">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Operations</p>
              <p className="text-sm text-muted-foreground">Visibilite des stocks en temps reel</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" />
                Deconnexion
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
