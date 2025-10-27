'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { ProductCard } from './components/product-card';

const products = [
  {
    name: 'Sauerteigbrot',
    description: 'Handwerklich hergestelltes rustikales Sauerteigbrot.',
    price: '5,50 €',
    image: PlaceHolderImages.find((img) => img.id === 'product-bread'),
  },
  {
    name: 'Schokoladentorte',
    description: 'Reichhaltige und dekadente Schokoladentorte.',
    price: '25,00 €',
    image: PlaceHolderImages.find((img) => img.id === 'product-cake'),
  },
  {
    name: 'Buttercroissants',
    description: 'Klassische, flockige Buttercroissants (6 Stück).',
    price: '9,00 €',
    image: PlaceHolderImages.find((img) => img.id === 'product-pastry'),
  },
  {
    name: 'Schokoladenkekse',
    description: 'Ein Dutzend hausgemachte Schokoladenkekse.',
    price: '12,00 €',
    image: PlaceHolderImages.find((img) => img.id === 'product-cookies'),
  },
];

export default function PreOrderPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cartItems, setCartItems] = useState(0);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="mb-8 space-y-2">
          <h1 className="font-headline text-3xl md:text-4xl">Produkte vorbestellen</h1>
          <p className="text-muted-foreground">Sichern Sie sich Ihre Favoriten. Wählen Sie ein Abholdatum und legen Sie los.</p>
        </div>
        <Button>
          <ShoppingCart className="mr-2" />
          Warenkorb ({cartItems})
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 1}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {products.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                onAddToCart={() => setCartItems((prev) => prev + 1)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
