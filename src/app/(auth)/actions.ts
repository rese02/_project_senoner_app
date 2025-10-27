'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// HINWEIS: Dieser Code läuft auf dem Server.
// Wir initialisieren Firebase hier, um auf Auth und Firestore zugreifen zu können.
// Die initializeFirebase Funktion sorgt dafür, dass dies nur einmal geschieht.
const { firestore, auth } = initializeFirebase();

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse.'),
  password: z.string().min(1, 'Passwort ist erforderlich.'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name ist erforderlich.'),
  email: z.string().email('Ungültige E-Mail-Adresse.'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein.'),
});

// State-Typen für useActionState
interface LoginState {
  success: boolean;
  message?: string;
  redirectUrl?: string;
}

interface RegisterState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  redirectUrl?: string;
}


export async function handleLogin(prevState: any, formData: FormData): Promise<LoginState> {
  console.log('handleLogin aufgerufen für FormData:', Object.fromEntries(formData.entries()));
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Ungültige Eingaben. Bitte überprüfen Sie E-Mail und Passwort.',
    };
  }
  const { email, password } = validatedFields.data;
  console.log(`Versuche Anmeldung für: ${email}`);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase Auth Login erfolgreich für UID:', userCredential.user.uid);
    const idToken = await userCredential.user.getIdToken();

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Fehler bei der Sitzungserstellung:', errorData);
        return { success: false, message: errorData.error || 'Sitzung konnte nicht erstellt werden.' };
    }
    
    const { redirectUrl } = await response.json();
    console.log('Sitzung erfolgreich erstellt. Weiterleitung zu:', redirectUrl);

    return { success: true, redirectUrl };
  } catch (e) {
    const error = e as AuthError;
    console.error('Login Fehler in handleLogin:', error.code, error.message);
    let message = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Ungültige E-Mail-Adresse oder falsches Passwort.';
    }
    return {
      success: false,
      message,
    };
  }
}

export async function handleRegister(prevState: any, formData: FormData): Promise<RegisterState> {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Ungültige Eingaben.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { name, email, password } = validatedFields.data;
  console.log(`Versuche Registrierung für: ${email}`);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase Auth Registrierung erfolgreich für UID:', user.uid);


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
    console.log('Benutzerdokument in Firestore erfolgreich erstellt für UID:', user.uid);

    const idToken = await user.getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        console.error('Fehler bei der Sitzungserstellung nach Registrierung');
        return { success: true, message: "Konto erstellt, aber Sitzung konnte nicht erstellt werden.", redirectUrl: '/login?registration=success_no_session' };
    }
    
    const { redirectUrl } = await response.json();
    console.log('Sitzung nach Registrierung erfolgreich erstellt. Weiterleitung zu:', redirectUrl);
    return { success: true, redirectUrl };

  } catch (e) {
    const error = e as AuthError;
    console.error('Registrierungsfehler in handleRegister:', error.code, error.message);
    let message = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Diese E-Mail-Adresse wird bereits verwendet.';
    }
    return { success: false, message };
  }
}

export async function handleLogout() {
    try {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
            method: 'POST',
        });
    } catch (error) {
        console.error("Logout fetch failed:", error);
    }
    redirect('/login');
}
