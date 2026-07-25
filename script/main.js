/* Arquivo de script: main.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: main.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC3qOCJ_8fJecNFvovRaAsJa5zntvlRvj8",
    authDomain: "petfinder-95132.firebaseapp.com",
    projectId: "petfinder-95132",
    storageBucket: "petfinder-95132.firebasestorage.app",
    messagingSenderId: "500128162071",
    appId: "1:500128162071:web:78777ff4b37a8875f2d752"
  };

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Função de login
  async function login(email, senha) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const token = await userCredential.user.getIdToken();
      console.log("Token JWT:", token);
      return token;
    } catch (error) {
      console.error("Erro no login:", error);
    }
  }

  // Exemplo de uso:
  // login("teste@teste.com", "123456");