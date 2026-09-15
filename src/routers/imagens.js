import crypto from "crypto";
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import vision from "@google-cloud/vision";
import { fileURLToPath } from "url";
import { admin, storage } from "./firebase.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caminhoCredencial =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "serviceAccountKey.json");
const credencial = fs.existsSync(caminhoCredencial)
  ? JSON.parse(fs.readFileSync(caminhoCredencial, "utf8"))
  : null;
const visionClient = new vision.ImageAnnotatorClient(
  credencial
    ? {
        projectId: credencial.project_id,
        credentials: {
          client_email: credencial.client_email,
          private_key: credencial.private_key,
        },
      }
    : undefined,
);
const tiposPermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(null, tiposPermitidos.has(file.mimetype));
  },
});

async function autenticar(request, response, next) {
  const cabecalho = request.headers.authorization || "";
  const token = cabecalho.startsWith("Bearer ")
    ? cabecalho.slice("Bearer ".length)
    : "";

  if (!token) {
    response.status(401).json({ error: "Usuário não autenticado." });
    return;
  }

  try {
    request.usuario = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error("Token Firebase inválido:", error);
    response.status(401).json({ error: "Sessão expirada. Entre novamente." });
  }
}

function classificacaoBloqueada(valor) {
  return ["LIKELY", "VERY_LIKELY"].includes(valor);
}

router.post(
  "/imagens/moderar-upload",
  autenticar,
  upload.single("imagem"),
  async (request, response) => {
    if (!request.file) {
      response
        .status(400)
        .json({ error: "Envie uma imagem JPG, PNG ou WEBP." });
      return;
    }

    let resultadoVision;
    try {
      [resultadoVision] = await visionClient.safeSearchDetection({
        image: { content: request.file.buffer },
      });
    } catch (error) {
      console.error("Erro ao analisar imagem no SafeSearch:", error);
      response.status(503).json({
        code: "MODERATION_UNAVAILABLE",
        error:
          "A moderação está temporariamente indisponível. O pet poderá ser cadastrado sem imagem.",
      });
      return;
    }

    const safeSearch = resultadoVision.safeSearchAnnotation || {};
    const imagemBloqueada =
      classificacaoBloqueada(safeSearch.adult) ||
      classificacaoBloqueada(safeSearch.racy);

    if (imagemBloqueada) {
      response.status(400).json({
        code: "IMAGE_REJECTED",
        error: "Essa imagem não pode ser utilizada. Escolha outra foto do pet.",
      });
      return;
    }

    const extensao = request.file.mimetype.split("/")[1].replace("jpeg", "jpg");
    const nomeArquivo = `pets/${request.usuario.uid}_${crypto.randomUUID()}.${extensao}`;
    const downloadToken = crypto.randomUUID();
    const arquivo = storage.file(nomeArquivo);

    try {
      await arquivo.save(request.file.buffer, {
        resumable: false,
        metadata: {
          contentType: request.file.mimetype,
          metadata: {
            uploadedBy: request.usuario.email || request.usuario.uid,
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      const url = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(nomeArquivo)}?alt=media&token=${downloadToken}`;
      response.status(201).json({ url });
    } catch (error) {
      console.error("Erro ao salvar imagem aprovada:", error);
      response.status(503).json({
        code: "MODERATION_UNAVAILABLE",
        error:
          "Não foi possível concluir o upload. O pet poderá ser cadastrado sem imagem.",
      });
    }
  },
);

export default router;
