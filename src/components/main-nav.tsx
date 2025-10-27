'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Home,
  Package,
  QrCode,
  Settings,
  ShoppingBasket,
  Star,
  Users,
  BarChart,
  Lightbulb,
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { AppLogo } from './app-logo';
import { useMemo } from 'react';
import { useUser } from '@/firebase';


const navConfig = {
  customer: [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/pre-order', label: 'Vorbestellung', icon: ShoppingBasket },
    { href: '/dashboard/loyalty', label: 'Treuekarte', icon: Heart },
    { href: '/dashboard/wheel-of-fortune', label: 'Glücksrad', icon: Star },
  ],
  employee: [
      { href: '/employee/scan', label: 'QR scannen', icon: QrCode },
  ],
  admin: [
      { href: '/admin', label: 'Statistiken', icon: BarChart },
      { href: '/admin/orders', label: 'Bestellungen', icon: Package },
      { href: '/admin/products', label: 'Produkte', icon: ShoppingBasket },
      { href: '/admin/customers', label: 'Kunden', icon: Users },
      { href: '/admin/marketing', label: 'Marketing', icon: Lightbulb },
  ],
};

const roleLabels: { [key: string]: string } = {
  dashboard: 'Kunde',
  'pre-order': 'Kunde',
  admin: 'Admin',
  employee: 'Mitarbeiter'
};


export function MainNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // This is a temporary solution to determine the role based on the URL.
  // In a real app, this would come from the user's session.
  const role = useMemo(() => {
    const segment = pathname.split('/')[1];
    if (segment === 'admin') return 'admin';
    if (segment === 'employee') return 'employee';
    return 'customer';
  }, [pathname]);

  const navItems = navConfig[role as keyof typeof navConfig] || [];
  const roleLabel = roleLabels[role] || 'Menü';

  return (
    <>
      <SidebarGroup>
        <div className="p-2">
          <AppLogo />
        </div>
      </SidebarGroup>

      {navItems.length > 0 && (
         <SidebarGroup>
            <SidebarGroupLabel>{roleLabel}</SidebarGroupLabel>
            <SidebarMenu>
                {navItems.map(item => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
      )}

      <SidebarGroup className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard/profile')} tooltip="Einstellungen">
              <Link href="/dashboard/profile">
                <Settings />
                <span>Einstellungen</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
