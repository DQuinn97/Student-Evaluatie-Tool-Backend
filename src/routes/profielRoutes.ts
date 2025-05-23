import express from "express";
import {
  setGebruikerData,
  setGebruikerFoto,
  getAuthGebruiker,
  getGebruikerById,
} from "../controllers/gebruikerController";
import { isAuth, isDocent } from "../middleware/authMiddleware";
import { foto, foto_upload } from "../middleware/multerMiddleware";
import { getInzendingenPerStudent } from "../controllers/inzendingController";

const router = express.Router();
/**
 * @swagger
 * /profiel:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Krijg de data van de huidig ingelogde gebruiker
 *     operationId: getAuthGebruiker
 *     tags: [Profiel]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Gebruiker'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /profiel/data:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Update een gebruiker zijn/haar naam, achternaam en/of tel.
 *     operationId: setGebruikerData
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
 *                 example: John
 *               achternaam:
 *                 type: string
 *                 example: Doe
 *               gsm:
 *                 type: string
 *                 example: 0412345678
 *     responses:
 *       '200':
 *         description: Gebruiker aangepast
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gebruiker'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /profiel/foto:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Update een gebruiker zijn/haar profielfoto
 *     operationId: setGebruikerFoto
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
 *         description: Profielfoto aangepast
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gebruiker'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '415':
 *         $ref: '#/components/responses/BadRequest_FileUpload'
 *
 * /profiel/{gebruikerId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: "[Docent] Vraag een gebruiker op"
 *     operationId: getGebruikerById
 *     tags: [Profiel]
 *     parameters:
 *       - name: gebruikerId
 *         in: path
 *         description: ID van de op te vragen gebruiker
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gebruiker'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /profiel/{gebruikerId}/inzendingen:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: "[Docent] Vraag alle inzendingen van een gebruiker op"
 *     operationId: getInzendingenPerStudent
 *     tags: [Profiel, Inzendingen]
 *     parameters:
 *       - name: gebruikerId
 *         in: path
 *         description: ID van de op te vragen gebruiker
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inzending'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 */
router
  .get("/", isAuth, getAuthGebruiker)
  .post("/data", isAuth, setGebruikerData)
  .post("/foto", isAuth, foto.single("foto"), foto_upload, setGebruikerFoto)
  .get("/:gebruikerId", isAuth, isDocent, getGebruikerById)
  .get("/:gebruikedId/inzendingen", isAuth, isDocent, getInzendingenPerStudent);

export default router;
