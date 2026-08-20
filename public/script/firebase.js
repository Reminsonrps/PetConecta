import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

// Configuração do projeto Firebase.
// Este bloco centraliza a conexão do app e evita múltiplas inicializações em páginas distintas.
// Se a organização do projeto mudar, revisar primeiro este arquivo para manter a mesma base de dados,
// autenticação e storage em todas as telas sem duplicar instâncias.
const firebaseConfig = {
  apiKey: "AIzaSyBpbc3GPkPHzN78cgXQsZWJ8ayzdiIdUYY",
  authDomain: "petconecta-db068.firebaseapp.com",
  projectId: "petconecta-db068",
  storageBucket: "petconecta-db068.firebasestorage.app",
  messagingSenderId: "1030110038715",
  appId: "1:1030110038715:web:151deca61831138159b79e",
};

// Chave do App Check para produção.
// ReCAPTCHA v3 protege a API do app contra abuso e requisições automatizadas.
// Manter esta chave em ambiente real é obrigatório antes do deploy em produção.
const APP_CHECK_SITE_KEY = "REPLACE_WITH_RECAPTCHA_V3_SITE_KEY";

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Compartilha as instancias do Firebase entre as paginas para evitar inicializacoes duplicadas.
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (
  APP_CHECK_SITE_KEY &&
  APP_CHECK_SITE_KEY !== "REPLACE_WITH_RECAPTCHA_V3_SITE_KEY"
) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(APP_CHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.warn(
      "App Check não foi inicializado. Configure sua site key do reCAPTCHA antes do deploy em produção.",
      error,
    );
  }
} else {
  console.warn(
    "App Check desativado no ambiente atual. Defina APP_CHECK_SITE_KEY com a chave do reCAPTCHA v3 antes do deploy em produção.",
  );
}

// Monta a query base de pets para manter a ordenação e, quando solicitado, o limite de retorno.
// Se novos filtros forem adicionados, alterar aqui evita repetir a mesma lógica em cada página.
export function buildPetsQuery({
  status = null,
  maxItems = 20,
  orderByData = true,
} = {}) {
  // Monta consultas padronizadas; orderByData pode ser desligado quando o Firestore exigiria indice composto.
  const constraints = [];

  if (orderByData) {
    constraints.push(orderBy("data", "desc"));
  }

  if (maxItems != null) {
    constraints.push(limit(maxItems));
  }

  if (status) {
    constraints.unshift(where("status", "==", status));
  }

  return query(collection(db, "pets"), ...constraints);
}
