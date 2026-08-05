/* Arquivo de script: contato.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: contato.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

import express from 'express';
import db from './firebase.js';

const router = express.Router();
const contatosCollection = db.collection('contatos');

// POST - criar contato
router.post('/contatos', async (req, res) => {
  const { nome, email, mensagem } = req.body;
  try {
    const docRef = await contatosCollection.add({ nome, email, mensagem });
    res.status(201).json({ message: 'Contato adicionado com sucesso', id: docRef.id });
  } catch (error) {
    console.error('Erro ao adicionar contato:', error);
    res.status(500).json({ error: 'Erro ao adicionar contato' });
  }
});

// GET - listar contatos
router.get('/contatos', async (req, res) => {
  try {
    const snapshot = await contatosCollection.get();
    const contatos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(contatos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar contatos', error: error.message });

  }
});

// PUT - atualizar contato
router.put('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, mensagem } = req.body;
  try {
    await contatosCollection.doc(id).update({ nome, email, mensagem });
    res.json({ message: 'Contato atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    res.status(500).json({ error: 'Erro ao atualizar contato' });
  }
});

// DELETE - remover contato
router.delete('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await contatosCollection.doc(id).delete();
    res.json({ message: 'Contato removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover contato:', error);
    res.status(500).json({ error: 'Erro ao remover contato' });
  }
});

export default router;
