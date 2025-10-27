import admin from 'firebase-admin';

// WICHTIG: Stellen Sie sicher, dass die Umgebungsvariable FIREBASE_SERVICE_ACCOUNT_KEY
// in Ihrer .env.local gesetzt ist und den JSON-Inhalt Ihres Service-Account-Schlüssels enthält.

function getServiceAccount() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
        throw new Error('Die Umgebungsvariable FIREBASE_SERVICE_ACCOUNT_KEY wurde nicht gefunden.');
    }
    try {
        return JSON.parse(serviceAccountJson);
    } catch (e) {
        throw new Error('Fehler beim Parsen des FIREBASE_SERVICE_ACCOUNT_KEY. Stellen Sie sicher, dass es sich um ein gültiges JSON handelt.');
    }
}


export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });

  return admin.app();
}
