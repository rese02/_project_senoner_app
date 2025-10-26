import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Bestellverwaltung</h1>
        <p className="text-muted-foreground">Hier können Sie alle Vorbestellungen einsehen und verwalten.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Alle Bestellungen</CardTitle>
          <CardDescription>Übersicht aller Kundenbestellungen.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Bestellverwaltungs-Interface wird hier implementiert.</p>
        </CardContent>
      </Card>
    </div>
  );
}
