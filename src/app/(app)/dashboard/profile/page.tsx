import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Profileinstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Kontoinformationen.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil bearbeiten</CardTitle>
          <CardDescription>Ändern Sie hier Ihre persönlichen Daten.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">Vorname</Label>
            <Input id="firstName" defaultValue="Max" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nachname</Label>
            <Input id="lastName" defaultValue="Mustermann" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="kunde@example.com" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button>Profil aktualisieren</Button>
            <Button variant="destructive">Abmelden</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
