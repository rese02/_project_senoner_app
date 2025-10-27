import admin from 'firebase-admin';

// WICHTIG: Stellen Sie sicher, dass Sie eine service-account.json-Datei im Stammverzeichnis Ihres Projekts haben
// und dass die Umgebungsvariable GOOGLE_APPLICATION_CREDENTIALS in Ihrer Entwicklungsumgebung
// (z. B. in .env.local) auf './service-account.json' gesetzt ist.
// Für die Produktion (z.B. Vercel, Firebase Hosting) müssen Sie die Dienstkontoschlüssel
// sicher als Umgebungsvariablen speichern.

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin.app();
}
