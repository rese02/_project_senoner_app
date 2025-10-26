import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewChart } from './components/overview-chart';
import { StatsCards } from './components/stats-cards';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="mb-8 space-y-2">
          <h1 className="font-headline text-3xl md:text-4xl">Admin Dashboard</h1>
          <p className="text-muted-foreground">Ein Überblick über die Leistung Ihrer App.</p>
        </div>
        <Button>
          <Download className="mr-2"/>
          Bericht exportieren
        </Button>
      </div>

      <StatsCards />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Verkaufsübersicht</CardTitle>
            <CardDescription>Umsatz der letzten 7 Tage.</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
