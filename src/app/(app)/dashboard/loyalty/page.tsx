import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { Gift, Star } from 'lucide-react';
import Image from 'next/image';

const rewards = [
  { points: 5, description: 'Ein kostenloser Kaffee' },
  { points: 10, description: 'Ein Gebäck Ihrer Wahl' },
  { points: 20, description: '10% Rabatt auf Ihren gesamten Einkauf' },
  { points: 50, description: 'Eine Schachtel Pralinen' },
];

export default function LoyaltyPage() {
  const qrCodeImage = PlaceHolderImages.find((img) => img.id === 'qr-code');
  const currentPoints = 7;

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Meine Treuekarte</h1>
        <p className="text-muted-foreground">
          Zeigen Sie diesen QR-Code im Geschäft vor, um Punkte zu sammeln und Prämien einzulösen.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-4">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6" />
                <div className="text-2xl font-bold">{currentPoints} Punkte</div>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
              {qrCodeImage && (
                <div className="relative mx-auto mb-4 h-48 w-48">
                  <Image
                    src={qrCodeImage.imageUrl}
                    alt={qrCodeImage.description}
                    layout="fill"
                    className="rounded-lg object-cover"
                    data-ai-hint={qrCodeImage.imageHint}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">Max Mustermann</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Verfügbare Prämien</CardTitle>
              <CardDescription>
                Lösen Sie Ihre gesammelten Punkte gegen diese fantastischen Prämien ein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {rewards.map((reward, index) => (
                  <li key={index}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Gift className="h-5 w-5 text-accent" />
                        <span>{reward.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{reward.points}</span>
                        <Star className="h-4 w-4 text-amber-400" />
                      </div>
                    </div>
                    {index < rewards.length - 1 && <Separator className="mt-4" />}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
