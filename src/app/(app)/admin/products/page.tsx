import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProductsPage() {
  return (
    <div className="container mx-auto">
       <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Produktverwaltung</h1>
        <p className="text-muted-foreground">Hier können Sie Kategorien und Produkte erstellen und bearbeiten.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Produkt- und Kategorieverwaltung</CardTitle>
          <CardDescription>CRUD-Interface für Produkte.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Produktverwaltungs-Interface wird hier implementiert.</p>
        </CardContent>
      </Card>
    </div>
  );
}
