import { AppLogo } from '@/components/app-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <AppLogo />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Willkommen zurück!</CardTitle>
          <CardDescription>Loggen Sie sich ein, um fortzufahren</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <div className="text-center text-sm text-muted-foreground">
        Noch kein Konto?{' '}
        <Button variant="link" asChild className="p-0">
          <Link href="/register">Jetzt registrieren</Link>
        </Button>
      </div>
    </div>
  );
}
