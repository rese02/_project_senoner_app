'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// This file uses the CLIENT-SIDE SDK for auth actions, which is correct.
// The server-side admin logic is handled in API routes.
const { firestore, auth } = initializeFirebase();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

async function getUserRole(uid: string): Promise<string> {
  try {
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data()?.role || 'customer';
    }
    return 'customer';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'customer';
  }
}

export async function handleLogin(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Ungültige Eingabe.',
    };
  }
  const { email, password } = validatedFields.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const role = await getUserRole(userCredential.user.uid);

    // Call the API route to set the session cookie
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        return { message: 'Sitzung konnte nicht erstellt werden.' };
    }

    const REDIRECTS: { [key: string]: string } = {
        admin: '/admin',
        employee: '/employee/scan',
        customer: '/dashboard',
    };
    
    const targetUrl = REDIRECTS[role] || '/dashboard';
    return { success: true, redirectUrl: targetUrl };
    
  } catch (e) {
    const error = e as AuthError;
    let message = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Ungültige E-Mail-Adresse oder falsches Passwort.';
    }
    return {
      message,
    };
  }
}

export async function handleRegister(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Ungültige Eingabe.',
    };
  }
  const { name, email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    await setDoc(doc(firestore, 'users', user.uid), {
      id: user.uid,
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email,
      role: 'customer',
      points: 0,
      rewards: [],
      coupons: [],
    });

    const idToken = await user.getIdToken();

     // Call the API route to set the session cookie
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        return { message: 'Sitzung konnte nicht erstellt werden.' };
    }

    return { success: true, redirectUrl: '/dashboard' };
  } catch (e) {
    const error = e as AuthError;
    let message = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Diese E-Mail-Adresse wird bereits verwendet.';
    }
    return { message };
  }
}

export async function handleLogout() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
        method: 'POST',
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }
  redirect('/login');
}
