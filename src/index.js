/* Arquivo de script: index.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: index.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import contatoRouter from "./routers/contato.js";
import firebaseRouter from "./routers/firebase.js";
import imagensRouter from "./routers/imagens.js";
import cors from "cors";
import multer from "multer";

const app = express();
app.use(cors());
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "../")));

// Middleware para parsear JSON
app.use(express.json());

// Usando a rota de contato
app.use("/api", contatoRouter);
app.use("/api", imagensRouter);

app.use((error, _request, response, _next) => {
  if (
    error instanceof multer.MulterError ||
    error?.code === "LIMIT_FILE_SIZE"
  ) {
    response.status(400).json({ error: "A imagem deve ter no máximo 5 MB." });
    return;
  }

  console.error("Erro não tratado na API:", error);
  response
    .status(500)
    .json({ error: "Não foi possível processar a solicitação." });
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.listen(port, () => {
  console.log(
    `Servidor rodando em http://localhost:${port} (CTRL + C para parar)`,
  );
});
