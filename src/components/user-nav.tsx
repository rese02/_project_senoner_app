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
import { useUser } from '@/firebase';

export function UserNav() {
  const { user } = useUser();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  // Dynamically get user initials
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'SN';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase() || 'SN';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={user?.photoURL || userAvatar.imageUrl} alt="User Avatar" />}
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'Max Mustermann'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || 'kunde@example.com'}</p>
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
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full text-left">Abmelden</button>
            </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
