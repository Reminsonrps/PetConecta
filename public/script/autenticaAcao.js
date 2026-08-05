import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpbc3GPkPHzN78cgXQsZWJ8ayzdiIdUYY",
  authDomain: "petconecta-db068.firebaseapp.com",
  projectId: "petconecta-db068",
  storageBucket: "petconecta-db068.firebasestorage.app",
  messagingSenderId: "1030110038715",
  appId: "1:1030110038715:web:151deca61831138159b79e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.autenticarAcao = async function(acao, id, emailCriador) {
  const usuarioSalvo = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  if (!usuarioSalvo) {
    alert("Você precisa estar logado para realizar esta ação.");
    window.location.href = 'criar-conta.html';
    return;
  }
  
  if (emailCriador && usuarioSalvo.usuario.toLowerCase() !== emailCriador.toLowerCase()) {
    alert("Apenas a pessoa que cadastrou este pet pode realizar esta ação.");
    return;
  }

  if (acao === 'excluir') {
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;
    try {
      await deleteDoc(doc(db, "pets", id));
      alert("Pet excluído com sucesso!");
    } catch(e) {
      console.error(e);
      alert("Erro ao excluir pet.");
    }
  } else if (acao === 'editar') {
    localStorage.setItem('petEditId', id);
    window.location.href = 'editar.html';
  } else if (acao === 'encontrei') {
    if (!confirm("Tem certeza que deseja marcar este pet como ENCONTRADO?")) return;
    try {
      await updateDoc(doc(db, "pets", id), { status: "encontrado" });
      alert("Status atualizado para ENCONTRADO!");
    } catch(e) {
      console.error(e);
      alert("Erro ao atualizar status.");
    }
  }
};
