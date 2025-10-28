'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase'; // Import useFirestore

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Registrieren'}
    </Button>
  );
}

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore(); // Get firestore instance

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Fehlende Eingaben',
        description: 'Bitte füllen Sie alle Felder aus.',
      });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
       toast({
        variant: 'destructive',
        title: 'Unsicheres Passwort',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Benutzer in Auth erstellen
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      // 2. Benutzerdokument in Firestore erstellen
      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email,
        role: 'customer', // Standardrolle
        points: 0,
        rewards: [],
        coupons: [],
      });
      
      // 3. Serverseitige Sitzung erstellen
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sitzung konnte nicht erstellt werden.');
      }

      const { redirectUrl } = await response.json();
      
      toast({
        title: 'Registrierung erfolgreich!',
        description: 'Ihr Konto wurde erstellt. Sie werden weitergeleitet...',
      });

      window.location.href = redirectUrl;

    } catch (error: any) {
      console.error('Registrierungs-Fehler:', error);
      let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
       if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
      }
      toast({
        variant: 'destructive',
        title: 'Fehler bei der Registrierung',
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Vollständiger Name</Label>
        <Input id="name" name="name" placeholder="Max Mustermann" required disabled={loading}/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="ihre@email.com" required disabled={loading}/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Mindestens 6 Zeichen"
          required
          minLength={6}
          disabled={loading}
        />
      </div>
      <SubmitButton pending={loading} />
    </form>
  );
}
