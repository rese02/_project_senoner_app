'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

type Product = {
  name: string;
  description: string;
  price: string;
  image?: ImagePlaceholder;
};

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    onAddToCart();
    toast({
      title: 'Zum Warenkorb hinzugefügt',
      description: `${product.name} wurde in Ihren Warenkorb gelegt.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      {product.image && (
        <div className="relative h-48 w-full">
          <Image
            src={product.image.imageUrl}
            alt={product.image.description}
            fill
            className="object-cover"
            data-ai-hint={product.image.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-lg">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-lg font-bold">{product.price}</span>
        <Button size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Hinzufügen
        </Button>
      </CardFooter>
    </Card>
  );
}
