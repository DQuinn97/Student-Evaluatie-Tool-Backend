import express from "express";
import {
  setGebruikerData,
  setGebruikerFoto,
  getAuthGebruiker,
  getGebruikerById,
} from "../controllers/gebruikerController";
import { isAuth, isDocent } from "../middleware/authMiddleware";
import { upload } from "../middleware/multerMiddleware";
import { getInzendingenPerStudent } from "../controllers/inzendingController";

const router = express.Router();
/**
 * @swagger
 * /profiel:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Krijg de data van de huidig ingelogde gebruiker
 *     tags: [Profiel]
 *     responses:
 *       '200':
 *         description: JSON data van de ingelogde gebruiker
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Gebruiker'
 *
 * /profiel/data:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een gebruiker zijn/haar naam, achternaam en/of tel.
 *     tags: [Profiel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naam:
 *                 type: string
 *               achternaam:
 *                 type: string
 *               gsm:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol aangepast
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 * /profiel/foto:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een gebruiker zijn/haar profielfoto
 *     tags: [Profiel]
 *     requestBody:
 *       required: true
 *       content:
 *         image/*:
 *             schema:
 *                 type: file
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Profielfoto succesvol aangepast
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 * /profiel/{gebruikerId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een gebruiker op
 *     tags: [Profiel]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gebruiker'
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 * /profiel/{gebruikerId}/inzendingen:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle inzendingen van een gebruiker op
 *     tags: [Profiel, Inzendingen]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inzending'
 *       '401':
 *         description: Gebruiker is niet ingelogd
 */
router
  .get("/", isAuth, getAuthGebruiker)
  .post("/data", isAuth, setGebruikerData)
  .post("/foto", isAuth, upload.single("foto"), setGebruikerFoto)
  .get("/:gebruikerId", isAuth, isDocent, getGebruikerById)
  .get("/:gebruikedId/inzendingen", isAuth, isDocent, getInzendingenPerStudent);

export default router;
