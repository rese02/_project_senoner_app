'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { handleLogout } from '@/app/(auth)/actions';

export function UserNav() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
            <AvatarFallback>SN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Max Mustermann</p>
            <p className="text-xs leading-none text-muted-foreground">kunde@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Abrechnung</DropdownMenuItem>
          <DropdownMenuItem disabled>Einstellungen</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <form action={handleLogout}>
            <Button type="submit" variant="ghost" className="w-full justify-start font-normal px-2">
                Abmelden
            </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
