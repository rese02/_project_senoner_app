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

export function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <SidebarGroup>
        <div className="p-2">
          <AppLogo />
        </div>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Kunde</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Dashboard">
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/pre-order')} tooltip="Vorbestellung">
              <Link href="/pre-order">
                <ShoppingBasket />
                <span>Vorbestellung</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard/loyalty')} tooltip="Treuekarte">
              <Link href="/dashboard/loyalty">
                <Heart />
                <span>Treuekarte</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard/wheel-of-fortune')} tooltip="Glücksrad">
              <Link href="/dashboard/wheel-of-fortune">
                <Star />
                <span>Glücksrad</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Mitarbeiter</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/employee/scan')} tooltip="QR scannen">
              <Link href="/employee/scan">
                <QrCode />
                <span>QR scannen</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/admin')} tooltip="Statistiken">
              <Link href="/admin">
                <BarChart />
                <span>Statistiken</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/admin/marketing')} tooltip="Marketing">
              <Link href="/admin/marketing">
                <Lightbulb />
                <span>Marketing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild disabled tooltip="Bestellungen">
              <Link href="#">
                <Package />
                <span>Bestellungen</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild disabled tooltip="Benutzer">
              <Link href="#">
                <Users />
                <span>Benutzer</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild disabled tooltip="Einstellungen">
              <Link href="#">
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
