'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, ShoppingBasket, QrCode, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

const customerNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/loyalty', label: 'Punkte', icon: Star },
  { href: '/pre-order', label: 'Bestellen', icon: ShoppingBasket },
];

const employeeNavItems = [
    { href: '/employee/scan', label: 'Scannen', icon: QrCode },
];

const adminNavItems = [
    { href: '/admin', label: 'Admin Home', icon: Home },
];


export function MobileNav() {
  const pathname = usePathname();

  // This is a simple role simulation. In a real app, you'd get the user's role from your auth context.
  const role = pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/employee') ? 'employee' : 'customer';

  const navItems = role === 'admin' ? adminNavItems : role === 'employee' ? employeeNavItems : customerNavItems;


  const renderNavItem = (item: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          'group flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive && 'text-primary'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="text-xs">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 z-20 block w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center justify-center px-2">
        {navItems.map(renderNavItem)}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="group flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground h-full">
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-xs">Mehr</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
                <DropdownMenuItem asChild><Link href="/dashboard/profile">Profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/admin">Admin</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/employee/scan">Mitarbeiter</Link></DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
