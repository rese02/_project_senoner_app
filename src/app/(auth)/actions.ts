'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    const { auth } = initializeFirebase();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const role = await getUserRole(user.uid);

    cookies().set(
      'session',
      JSON.stringify({ uid: user.uid, role, email: user.email, name: user.displayName }),
      { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 }
    );
    
    let targetUrl = '/dashboard';
    if (role === 'admin') {
        targetUrl = '/admin';
    } else if (role === 'employee') {
        targetUrl = '/employee/scan';
    }
    return { success: true, redirectUrl: targetUrl };

  } catch (e) {
    const error = e as AuthError;
    let message = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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
    const { auth, firestore } = initializeFirebase();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    await setDoc(doc(firestore, "users", user.uid), {
        id: user.uid,
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email,
        role: "customer",
        points: 0,
        rewards: [],
        coupons: [],
    });

    const role = 'customer';
    cookies().set(
        'session',
        JSON.stringify({ uid: user.uid, role, email: user.email, name }),
        { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 }
    );
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
    cookies().delete('session');
    redirect('/login');
}
