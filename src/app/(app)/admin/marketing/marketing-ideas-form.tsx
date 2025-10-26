'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getMarketingIdeas } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : 'Ideen generieren'}
    </Button>
  );
}

export function MarketingIdeasForm() {
  const [state, formAction] = useFormState(getMarketingIdeas, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.ideas) {
      formRef.current?.reset();
      toast({
        title: 'Ideen generiert!',
        description: 'Ihre neuen Marketingideen sind fertig.',
      });
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Es konnte keine Idee generiert werden. Bitte versuchen Sie es erneut.',
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="season">Saison</Label>
          <Select name="season" required>
            <SelectTrigger id="season">
              <SelectValue placeholder="Wählen Sie eine Saison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Frühling">Frühling</SelectItem>
              <SelectItem value="Sommer">Sommer</SelectItem>
              <SelectItem value="Herbst">Herbst</SelectItem>
              <SelectItem value="Winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productDescription">Produktbeschreibung</Label>
          <Textarea
            id="productDescription"
            name="productDescription"
            placeholder="z.B. handwerklich hergestelltes Brot, saisonale Kuchen, spezielle Kaffeemischungen..."
            required
            rows={4}
          />
        </div>

        <SubmitButton />
      </form>

      {state.success && state.ideas && (
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Ihre generierten Ideen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {state.ideas.map((idea, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Lightbulb className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
