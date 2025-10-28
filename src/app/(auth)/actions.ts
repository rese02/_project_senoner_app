'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// HINWEIS: Dieser Code läuft auf dem Server.
const { firestore, auth } = initializeFirebase();

const registerSchema = z.object({
  name: z.string().min(2, 'Name ist erforderlich.'),
  email: z.string().email('Ungültige E-Mail-Adresse.'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein.'),
});

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
      role: 'customer', // Standardrolle für neue Benutzer
      points: 0,
      rewards: [],
      coupons: [],
    });
    console.log('Benutzerdokument in Firestore erfolgreich erstellt für UID:', user.uid);

    // After creating the user and their Firestore doc, create a session
    const idToken = await user.getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Fehler bei der Sitzungserstellung nach Registrierung:', errorData.error);
        // Even if session fails, account is created. Redirect to login to be safe.
        return { success: true, message: "Konto erstellt. Bitte melden Sie sich an.", redirectUrl: '/login' };
    }
    
    const { redirectUrl } = await response.json();
    console.log('Sitzung nach Registrierung erfolgreich erstellt. Weiterleitung zu:', redirectUrl);
    return { success: true, redirectUrl };

  } catch (e: any) {
    console.error('Registrierungsfehler in handleRegister:', e.code, e.message);
    let message = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (e.code === 'auth/email-already-in-use') {
      message = 'Diese E-Mail-Adresse wird bereits verwendet.';
    }
    return { success: false, message };
  }
}

export async function handleLogout() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/auth/logout`, {
        method: 'POST',
    });

    if(!response.ok) {
        console.error("Server-side logout failed");
    }
    redirect('/login');
}
