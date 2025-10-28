import admin from 'firebase-admin';

// WICHTIG: Stellt sicher, dass sich eine Datei namens `service-account.json`
// im Stammverzeichnis Ihres Projekts befindet. Diese Datei wird von git ignoriert.

// Robuste Methode, um die Service-Account-Anmeldeinformationen zu erhalten
function getServiceAccount() {
  try {
    // Diese Methode ist zuverlässiger als Umgebungsvariablen in Next.js-Serverumgebungen
    const serviceAccount = require('../../service-account.json');
    return serviceAccount;
  } catch (error) {
    console.error('Fehler beim Laden der service-account.json:', error);
    throw new Error('Die Datei service-account.json konnte nicht im Stammverzeichnis gefunden oder gelesen werden. Bitte stellen Sie sicher, dass sie existiert und ein gültiges JSON-Format hat.');
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
