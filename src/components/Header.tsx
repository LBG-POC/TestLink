import Link from 'next/link';
import { Button } from './ui/button';
import { TestTube2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { logoutAction } from '@/app/login/actions';

function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost">Logout</Button>
    </form>
  );
}

export default function Header() {
  const cookieStore = cookies();
  const isAdminAuthenticated = cookieStore.has('admin-password');

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary/90">
          <TestTube2 className="w-6 h-6" />
          <span>TestLink</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
          {isAdminAuthenticated && <LogoutButton />}
        </nav>
      </div>
    </header>
  );
}
