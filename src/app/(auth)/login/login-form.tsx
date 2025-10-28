'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Anmelden'}
    </Button>
  );
}

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    toast({
        title: 'Anmeldung wird verarbeitet...',
        description: 'Bitte einen Moment Geduld.',
    });

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Fehlende Eingaben',
        description: 'Bitte geben Sie E-Mail und Passwort ein.',
      });
      setLoading(false);
      return;
    }

    try {
      console.log('1. Attempting client-side sign in...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('2. Client-side sign in SUCCESSFUL. User:', user.uid);
      
      console.log('3. Getting ID token...');
      const idToken = await user.getIdToken();
      console.log('4. Got ID token. Now sending to /api/auth/session');
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      console.log('5. Received response from server. Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server returned an error:', errorData);
        throw new Error(errorData.details || 'Session creation failed on server.');
      }

      const { redirectUrl } = await response.json();
      console.log('6. Server session created successfully! Redirecting to:', redirectUrl);
      
      toast({
        title: 'Anmeldung erfolgreich!',
        description: 'Willkommen zurück! Sie werden weitergeleitet...',
      });
      
      router.push(redirectUrl || '/dashboard');

    } catch (error: any) {
      console.error("Login process failed at some point:", error);
      let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Ungültige E-Mail-Adresse oder falsches Passwort.';
            break;
          default:
            errorMessage = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
            break;
        }
      } else {
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Fehler bei der Anmeldung',
        description: errorMessage,
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ihre@email.com"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>
      <SubmitButton pending={loading} />
    </form>
  );
}
