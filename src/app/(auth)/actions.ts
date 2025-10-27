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
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Ungültige Eingaben. Bitte überprüfen Sie E-Mail und Passwort.',
    };
  }
  const { email, password } = validatedFields.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Die API-Route kümmert sich um das Setzen des sicheren Session-Cookies,
    // das Auslesen der Rolle, das Setzen von Custom Claims und gibt die Weiterleitungs-URL zurück.
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'Sitzung konnte nicht erstellt werden.' };
    }
    
    const { redirectUrl } = await response.json();

    return { success: true, redirectUrl };
  } catch (e) {
    const error = e as AuthError;
    let message = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    // Firebase gibt spezifische Fehlercodes für häufige Probleme zurück
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Ungültige E-Mail-Adresse oder falsches Passwort.';
    }
    console.error('Login Error:', error.code, error.message);
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

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    // Firestore-Dokument für den neuen Benutzer mit der Standardrolle 'customer' erstellen
    await setDoc(doc(firestore, 'users', user.uid), {
      id: user.uid,
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email,
      role: 'customer', // Standardrolle für alle neuen Benutzer
      points: 0,
      rewards: [],
      coupons: [],
    });

    // Nach erfolgreicher Registrierung den Benutzer direkt anmelden und Session-Cookie setzen
    const idToken = await user.getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        // Dieser Fall ist unwahrscheinlich, aber wichtig für die Robustheit
        return { success: true, redirectUrl: '/login?registration=success_no_session' };
    }
    
    const { redirectUrl } = await response.json();
    return { success: true, redirectUrl };

  } catch (e) {
    const error = e as AuthError;
    let message = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Diese E-Mail-Adresse wird bereits verwendet.';
    }
    console.error('Registration Error:', error.code, error.message);
    return { success: false, message };
  }
}

export async function handleLogout() {
    // Die API-Route kümmert sich um das Löschen des Cookies.
    try {
        // Der Request muss nicht auf eine Antwort warten
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
            method: 'POST',
        });
    } catch (error) {
        console.error("Logout fetch failed:", error);
    }
    // Nach dem Logout immer zur Login-Seite weiterleiten.
    redirect('/login');
}
