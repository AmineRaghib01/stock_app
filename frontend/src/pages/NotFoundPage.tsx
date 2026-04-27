import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Cette page n'existe pas</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        La page a peut-etre ete deplacee ou le lien est obsolete. Retournez au tableau de bord pour continuer.
      </p>
      <Link to="/">
        <Button type="button">Retour au tableau de bord</Button>
      </Link>
    </div>
  );
}
