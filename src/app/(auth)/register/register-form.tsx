'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { handleRegister } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
  errors: {},
  redirectUrl: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Registrieren'}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(handleRegister, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      toast({
        title: 'Registrierung erfolgreich!',
        description: 'Ihr Konto wurde erstellt. Sie werden weitergeleitet...',
      });
      // Wichtig: window.location.href erzwingt ein Neuladen der Seite.
      // Dadurch wird sichergestellt, dass die Middleware den neuen Session-Cookie korrekt auswertet.
      window.location.href = state.redirectUrl;
    } else if (state.message) {
      // Handle cases where registration is successful but session creation fails
       if (state.success) {
         toast({
            title: 'Konto erstellt',
            description: state.message,
         });
         if(state.redirectUrl) {
            router.push(state.redirectUrl);
         }
       } else {
        // Handle registration failure
        toast({
          variant: 'destructive',
          title: 'Fehler bei der Registrierung',
          description: state.message,
        });
       }
    }
  }, [state, router, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Vollständiger Name</Label>
        <Input id="name" name="name" placeholder="Max Mustermann" required />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="ihre@email.com" required />
         {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email.join(', ')}</p>}
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
        />
         {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
