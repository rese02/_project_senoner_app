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

const customerNav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/pre-order', label: 'Vorbestellung', icon: ShoppingBasket },
  { href: '/dashboard/loyalty', label: 'Treuekarte', icon: Heart },
  { href: '/dashboard/wheel-of-fortune', label: 'Glücksrad', icon: Star },
];

const employeeNav = [
    { href: '/employee/scan', label: 'QR scannen', icon: QrCode },
];

const adminNav = [
    { href: '/admin', label: 'Statistiken', icon: BarChart },
    { href: '/admin/orders', label: 'Bestellungen', icon: Package },
    { href: '/admin/products', label: 'Produkte', icon: ShoppingBasket },
    { href: '/admin/customers', label: 'Kunden', icon: Users },
    { href: '/admin/seasonal', label: 'Marketing', icon: Lightbulb },
];


export function MainNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const role = pathname.split('/')[1];

  return (
    <>
      <SidebarGroup>
        <div className="p-2">
          <AppLogo />
        </div>
      </SidebarGroup>

      {role === 'dashboard' && (
        <SidebarGroup>
            <SidebarGroupLabel>Kunde</SidebarGroupLabel>
            <SidebarMenu>
                {customerNav.map(item => (
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
      
      {role === 'employee' && (
        <SidebarGroup>
            <SidebarGroupLabel>Mitarbeiter</SidebarGroupLabel>
            <SidebarMenu>
                 {employeeNav.map(item => (
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

      {role === 'admin' && (
         <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
                {adminNav.map(item => (
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
