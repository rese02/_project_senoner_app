'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/library';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ScanPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          controlsRef.current = await codeReader.decodeFromVideoElement(videoRef.current, (result, error, controls) => {
            if (result) {
              setScanResult(result.getText());
              controls.stop();
            }
            if (error) {
              // We can ignore NotFoundException as it's common during scanning.
              if (error.name !== 'NotFoundException') {
                console.error(error);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Kamerazugriff verweigert',
          description: 'Bitte aktivieren Sie den Kamerazugriff in Ihren Browsereinstellungen.',
        });
      }
    };

    getCameraPermission();

    return () => {
      controlsRef.current?.stop();
    };
  }, [toast]);

  const handleCloseDialog = () => {
    setScanResult(null);
    // Only attempt to restart scanning if we have active controls
    if (videoRef.current && controlsRef.current) {
        const codeReader = new BrowserQRCodeReader();
        codeReader.decodeFromVideoElement(videoRef.current, (result, error, controls) => {
             if (result) {
              setScanResult(result.getText());
              controls.stop();
            }
        }).then(newControls => {
            controlsRef.current = newControls;
        }).catch(err => {
            if (err.name !== 'NotFoundException') {
                console.error("Could not restart scanner:", err);
            }
        });
    }
  };
  
  const handleAwardStamp = () => {
    toast({
      title: 'Erfolg',
      description: 'Stempel wurde dem Kunden erfolgreich gutgeschrieben.',
    });
    handleCloseDialog();
  };

  const handleRedeemCoupon = () => {
    toast({
      title: 'Erfolg',
      description: 'Gutschein wurde erfolgreich eingelöst.',
    });
    handleCloseDialog();
  };

  const handleInvalidCode = () => {
    toast({
      variant: 'destructive',
      title: 'Fehler',
      description: 'Ungültiger oder abgelaufener QR-Code. Bitte versuchen Sie es erneut.',
    });
    handleCloseDialog();
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
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
             <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                <Camera className="h-16 w-16" />
                <p className="mt-2 text-center">Kamerazugriff ist erforderlich.</p>
              </div>
            )}
             {hasCameraPermission === null && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary">
                <p>Kamera wird initialisiert...</p>
              </div>
            )}
          </div>
           {hasCameraPermission === false && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Kamerazugriff erforderlich</AlertTitle>
                <AlertDescription>
                  Bitte erlauben Sie den Zugriff auf die Kamera in den Einstellungen Ihres Browsers, um diese Funktion zu nutzen.
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
      
       <AlertDialog open={!!scanResult} onOpenChange={handleCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scan erfolgreich!</AlertDialogTitle>
            <AlertDialogDescription>
              <p>QR-Code-Inhalt:</p>
              <pre className="mt-2 rounded-md bg-secondary p-4 text-secondary-foreground">{scanResult}</pre>
              <p className="mt-4">Welche Aktion möchten Sie ausführen?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <Button onClick={handleAwardStamp} className="w-full">Stempel vergeben</Button>
            <Button onClick={handleRedeemCoupon} variant="secondary" className="w-full">Gutschein einlösen</Button>
            <Button onClick={handleInvalidCode} variant="outline" className="w-full">Als ungültig markieren</Button>
            <Button onClick={handleCloseDialog} variant="destructive" className="w-full sm:w-auto">Abbrechen</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
