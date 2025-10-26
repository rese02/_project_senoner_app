import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wheel } from './components/wheel';

export default function WheelOfFortunePage() {
  return (
    <div className="container mx-auto flex flex-col items-center">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="font-headline text-3xl md:text-4xl">Glücksrad</h1>
        <p className="text-muted-foreground">Drehen Sie und gewinnen Sie exklusive Preise! Sie haben heute 1 Drehung übrig.</p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center font-headline text-xl">Tägliche Belohnung</CardTitle>
          <CardDescription className="text-center">Jeden Tag eine neue Chance zu gewinnen.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Wheel />
        </CardContent>
      </Card>
    </div>
  );
}
