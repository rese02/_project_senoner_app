'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { handleLogin } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
  redirectUrl: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Anmelden'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(handleLogin, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      toast({
        title: 'Anmeldung erfolgreich',
        description: 'Willkommen zurück!',
      });
      // Wichtig: window.location.href erzwingt ein Neuladen der Seite.
      // Dadurch wird sichergestellt, dass die Middleware den neuen Session-Cookie korrekt auswertet
      // und die richtigen Custom Claims für die Navigation geladen werden.
      window.location.href = state.redirectUrl;
    } else if (!state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'Fehler bei der Anmeldung',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ihre@email.com"
          required
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
        />
      </div>
      <SubmitButton />
    </form>
  );
}
