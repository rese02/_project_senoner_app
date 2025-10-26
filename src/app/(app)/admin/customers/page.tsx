import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminCustomersPage() {
  return (
    <div className="container mx-auto">
       <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Kundenverwaltung</h1>
        <p className="text-muted-foreground">Hier können Sie Kunden einsehen und deren Rollen verwalten.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Kundenliste</CardTitle>
          <CardDescription>Liste aller registrierten Benutzer.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Kundenverwaltungs-Interface wird hier implementiert.</p>
        </CardContent>
      </Card>
    </div>
  );
}
