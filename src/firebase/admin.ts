import admin from 'firebase-admin';

// Robuste Methode, um die Service-Account-Anmeldeinformationen zu erhalten
function getServiceAccount() {
  try {
    // Diese Umgebungsvariable MUSS in Ihrer Hosting-Umgebung gesetzt sein.
    // Sie sollte den gesamten Inhalt der JSON-Datei als String enthalten.
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_KEY_JSON;
    if (!serviceAccountJson) {
      throw new Error('Die Umgebungsvariable SERVICE_ACCOUNT_KEY_JSON wurde nicht gefunden.');
    }
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error('Fehler beim Parsen der service-account.json aus der Umgebungsvariable:', error);
    throw new Error('Die Service-Account-Informationen konnten nicht geladen werden. Stellen Sie sicher, dass die Umgebungsvariable SERVICE_ACCOUNT_KEY_JSON korrekt gesetzt und ein gültiges JSON ist.');
  }
}

/**
 * Initialisiert die Firebase Admin App idempotent.
 * Gibt die initialisierte App-Instanz zurück.
 */
export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin.app();
}

// Initialisiere die App sofort, damit die Instanzen exportiert werden können
getAdminApp();

// Exportiere die initialisierten Admin-Dienste
export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
