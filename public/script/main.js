/* Arquivo de script: main.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: main.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

/*
  Script principal de autenticação do site.
  Responsável por fazer login no Firebase usando e-mail e senha.
*/
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Autenticacao experimental por e-mail e senha; o fluxo ativo deve reutilizar o formulario da pagina.
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
