'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, ShoppingBasket, QrCode, LayoutGrid, BarChart, Settings, Heart, Users, Package, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { useUser } from '@/firebase';

const navConfig = {
  customer: [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/loyalty', label: 'Punkte', icon: Heart },
    { href: '/pre-order', label: 'Bestellen', icon: ShoppingBasket },
  ],
  employee: [
      { href: '/employee/scan', label: 'Scannen', icon: QrCode },
      // Add more employee items if needed, up to 3
  ],
  admin: [
      { href: '/admin', label: 'Home', icon: BarChart },
      { href: '/admin/orders', label: 'Best.', icon: Package },
      { href: '/admin/customers', label: 'Kunden', icon: Users },
  ],
};


export function MobileNav() {
  const pathname = usePathname();
  const { role, isUserLoading } = useUser();

  if (isUserLoading) {
    return null; // or a loading skeleton
  }

  const navItems = role ? navConfig[role as keyof typeof navConfig] : [];

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
            <DropdownMenuContent align="end" className="mb-2 w-56">
                 <DropdownMenuLabel>Kundenbereich</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild><Link href="/dashboard/profile"><Settings className="mr-2"/>Profil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/wheel-of-fortune"><Star className="mr-2"/>Glücksrad</Link></DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Andere Bereiche</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild><Link href="/admin"><BarChart className="mr-2"/>Admin Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/admin/marketing"><Lightbulb className="mr-2"/>Marketing</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/employee/scan"><QrCode className="mr-2"/>Mitarbeiter-Scan</Link></DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
