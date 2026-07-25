// Importações necessárias (usando npm ou tags de script correspondentes)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Configuração do seu projeto PetConecta
const firebaseConfig = {
  projectId: "petconecta-db068",
  // Adicione aqui as demais chaves do console (apiKey, authDomain, storageBucket, etc.)
};

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Escuta os pets em tempo real no Firestore
window.addEventListener('DOMContentLoaded', () => {
  onSnapshot(collection(db, "pets"), (snapshot) => {
    const pets = [];
    snapshot.forEach(doc => {
      pets.push({ id: doc.id, ...doc.data() });
    });
    exibirPets(pets);
  });
});

// Cadastro e Upload de Foto
document.getElementById('cadastroPet').addEventListener('submit', async function(event) {
  event.preventDefault();

  const dados = new FormData(event.target);
  const arquivoFoto = dados.get('fotoPet');

  if (!arquivoFoto || !arquivoFoto.type.startsWith('image/')) {
    alert('Por favor, envie uma imagem válida.');
    return;
  }

  try {
    // 1. Upload da foto para o Cloud Storage
    const nomeArquivo = `pets/${Date.now()}_${arquivoFoto.name}`;
    const storageRef = ref(storage, nomeArquivo);
    const uploadResult = await uploadBytes(storageRef, arquivoFoto);
    const urlFoto = await getDownloadURL(uploadResult.ref);

    // 2. Salva o documento no Firestore
    const dadosObj = {
      nomePet: dados.get('nomePet'),
      idadePet: dados.get('idadePet'),
      tipoPet: dados.get('tipoPet'),
      racaPet: dados.get('racaPet'),
      sexoPet: dados.get('sexoPet'),
      portePet: dados.get('portePet'),
      descricaoPet: dados.get('descricaoPet'),
      vacinaPet: !!dados.get('vacinaPet'),
      castradoPet: !!dados.get('castradoPet'),
      fotoPet: urlFoto, // URL pública da foto
      caminhoFotoStorage: nomeArquivo // Guardamos para deletar depois
    };

    await addDoc(collection(db, "pets"), dadosObj);
    document.getElementById('mensagem-sucesso').style.display = 'block';
    event.target.reset();
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error);
    alert("Erro ao salvar os dados.");
  }
});

// Excluir pet (Firestore + Storage)
async function excluirPet(id, caminhoFotoStorage) {
  if (confirm("Deseja realmente excluir este pet?")) {
    try {
      // Deleta o documento do banco
      await deleteDoc(doc(db, "pets", id));
      
      // Deleta a foto do storage
      if (caminhoFotoStorage) {
        const fotoRef = ref(storage, caminhoFotoStorage);
        await deleteObject(fotoRef);
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  }
}
