/* Arquivo de script: index.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: index.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import contatoRouter from './routers/contato.js';
import firebaseRouter from './routers/firebase.js';
import cors from 'cors';

const app = express();
app.use(cors());
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../')));

// Middleware para parsear JSON
app.use(express.json());

// Usando a rota de contato
app.use('/api', contatoRouter);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port} (CTRL + C para parar)`);
});
