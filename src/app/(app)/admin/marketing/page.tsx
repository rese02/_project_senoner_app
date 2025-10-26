import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingIdeasForm } from './marketing-ideas-form';

export default function MarketingPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Saisonale Marketing-Ideen</h1>
        <p className="text-muted-foreground">
          Nutzen Sie KI, um kreative Marketingideen für die aktuelle Saison und Ihre Produkte zu generieren.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Ideen-Generator</CardTitle>
          <CardDescription>
            Wählen Sie eine Jahreszeit und beschreiben Sie Ihr Produkt, um loszulegen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketingIdeasForm />
        </CardContent>
      </Card>
    </div>
  );
}
