import { Box } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-3 text-primary">
      <Box className="h-8 w-8" />
      <span className="font-headline text-2xl font-bold tracking-tight">Senoner Sarteur</span>
    </div>
  );
}
