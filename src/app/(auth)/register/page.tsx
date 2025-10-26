import { AppLogo } from '@/components/app-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from './register-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <AppLogo />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Konto erstellen</CardTitle>
          <CardDescription>Treten Sie unserem digitalen Treueprogramm bei</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
      <div className="text-center text-sm text-muted-foreground">
        Haben Sie bereits ein Konto?{' '}
        <Button variant="link" asChild className="p-0">
          <Link href="/login">Hier anmelden</Link>
        </Button>
      </div>
    </div>
  );
}
