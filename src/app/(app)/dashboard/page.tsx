import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, ShoppingBasket, Star } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Hallo, Max!</h1>
        <p className="text-muted-foreground">Willkommen in Ihrem persönlichen Bereich.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/20 p-3">
                <ShoppingBasket className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-headline text-xl">Vorbestellen</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Sichern Sie sich Ihre Lieblingsprodukte im Voraus.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild>
              <Link href="/pre-order">
                Jetzt bestellen <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/20 p-3">
                <Heart className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-headline text-xl">Treueprogramm</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Sehen Sie sich Ihren Punktestand an und lösen Sie Prämien ein.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild>
              <Link href="/dashboard/loyalty">
                Meine Treuekarte <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/20 p-3">
                <Star className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-headline text-xl">Glücksrad</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Drehen Sie das Rad und gewinnen Sie tolle Preise und Rabatte.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild>
              <Link href="/dashboard/wheel-of-fortune">
                Jetzt drehen <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
