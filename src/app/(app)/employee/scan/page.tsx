'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, QrCode } from 'lucide-react';

export default function ScanPage() {
  const { toast } = useToast();

  const handleAwardStamp = () => {
    toast({
      title: 'Erfolg',
      description: 'Stempel wurde dem Kunden erfolgreich gutgeschrieben.',
    });
  };

  const handleRedeemCoupon = () => {
    toast({
      title: 'Erfolg',
      description: 'Gutschein wurde erfolgreich eingelöst.',
    });
  };

  const handleInvalidCode = () => {
    toast({
      variant: 'destructive',
      title: 'Fehler',
      description: 'Ungültiger oder abgelaufener QR-Code. Bitte versuchen Sie es erneut.',
    });
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">QR-Code scannen</h1>
        <p className="text-muted-foreground">
          Richten Sie die Kamera auf den QR-Code des Kunden, um Stempel zu vergeben oder Gutscheine einzulösen.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="aspect-square w-full rounded-lg bg-secondary flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Camera className="mx-auto h-16 w-16" />
              <p>Kameraansicht Platzhalter</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Aktionen</h2>
        <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={handleAwardStamp} size="lg">Stempel vergeben</Button>
            <Button onClick={handleRedeemCoupon} size="lg" variant="secondary">Gutschein einlösen</Button>
            <Button onClick={handleInvalidCode} size="lg" variant="outline">Ungültigen Code simulieren</Button>
        </div>
      </div>
    </div>
  );
}
