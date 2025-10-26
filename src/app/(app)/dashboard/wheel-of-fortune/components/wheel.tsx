'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const prizes = [
  '10% Rabatt',
  'Kostenloser Kaffee',
  'Niete',
  'Ein Gebäck',
  '5 Bonuspunkte',
  'Niete',
  '2-für-1-Angebot',
  'Niete',
];

export function Wheel() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const newRotation = rotation + 360 * 5 + Math.random() * 360;
    const prizeIndex = Math.floor(((newRotation % 360) / 360) * prizes.length);
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[prizeIndex]);
    }, 4000); // Corresponds to the animation duration
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-8">
      <div className="relative h-64 w-64 md:h-80 md:w-80">
        <div
          className="absolute inset-0 transition-transform duration-[4000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {prizes.map((prize, i) => (
              <g key={i} transform={`rotate(${(i * 360) / prizes.length}, 50, 50)`}>
                <path d="M50 50 L50 0 A50 50 0 0 1 78.78 36.13 Z" fill={i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                <text
                  x="65"
                  y="20"
                  transform="rotate(22.5, 50, 50)"
                  fill={i % 2 === 0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--accent-foreground))'}
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {prize.split(' ')[0]}
                </text>
                 <text
                  x="65"
                  y="28"
                  transform="rotate(22.5, 50, 50)"
                  fill={i % 2 === 0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--accent-foreground))'}
                  fontSize="5"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {prize.split(' ').slice(1).join(' ')}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
            <div className="h-6 w-6 bg-card-foreground rounded-full border-4 border-card" />
        </div>
      </div>

      <Button onClick={handleSpin} disabled={spinning} size="lg" className="px-12 py-6 text-lg">
        {spinning ? 'Am drehen...' : 'Drehen!'}
      </Button>

      <AlertDialog open={!!result} onOpenChange={() => setResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">
              {result !== 'Niete' ? 'Herzlichen Glückwunsch!' : 'Schade!'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {result !== 'Niete'
                ? `Sie haben gewonnen: ${result}! Ihr Gutschein wurde Ihrem Konto hinzugefügt.`
                : 'Leider kein Gewinn dieses Mal. Versuchen Sie es morgen wieder!'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
