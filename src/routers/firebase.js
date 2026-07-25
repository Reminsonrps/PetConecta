/* Arquivo de script: firebase.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: firebase.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(path.join(__dirname, './serviceAccountKey.json'))
  });
}

const db = admin.firestore();
export default db;

