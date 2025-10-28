'use server';

import { redirect } from 'next/navigation';

export async function handleLogout() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/auth/logout`, {
        method: 'POST',
    });

    if(!response.ok) {
        console.error("Server-side logout failed");
    }
    redirect('/login');
}
