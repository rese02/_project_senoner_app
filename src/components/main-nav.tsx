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
      { href: '/admin/seasonal', label: 'Marketing', icon: Lightbulb },
  ],
};

const roleLabels = {
  dashboard: 'Kunde',
  pre_order: 'Kunde',
  admin: 'Admin',
  employee: 'Mitarbeiter'
} as const;

type Role = keyof typeof roleLabels;


export function MainNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const role = useMemo(() => {
    const segment = pathname.split('/')[1];
    if (segment in roleLabels) {
      // Special case for pre-order which belongs to customer dashboard
      if (segment === 'pre-order') return 'customer';
      
      const roleKey = roleLabels[segment as Role];
      if (roleKey === 'Kunde') return 'customer';
      if (roleKey === 'Admin') return 'admin';
      if (roleKey === 'Mitarbeiter') return 'employee';
    }
    return 'customer'; // Default role
  }, [pathname]);

  const navItems = navConfig[role] || [];
  const roleLabel = roleLabels[pathname.split('/')[1] as Role] || 'Kunde';

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
