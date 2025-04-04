import express from "express";
import {
  addKlasgroep,
  getKlasgroep,
  getKlasgroepen,
  pushStudentToKlasgroep,
  pushVakToKlasgroep,
  removeStudentFromKlasgroep,
  removeVakFromKlasgroep,
} from "../controllers/klasgroepController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";
import { getTaken, addTaak } from "../controllers/taakController";
import { isUnique } from "../middleware/uniqueMiddleware";

const router = express.Router();
/**
 * @swagger
 * /klassen:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle klasgroepen op
 *     tags: [Klassen]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Klasgroep'
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een nieuwe klasgroep aan
 *     tags: [Klassen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naam:
 *                 type: string
 *               beginjaar:
 *                 type: number
 *                 example: 2024
 *               eindjaar:
 *                 type: number
 *                 example: 2025
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *
 * /klassen/{klasgroepId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een klasgroep op
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de op te vragen klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *
 * /klassen/{klasgroepId}/studenten:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een student toe aan een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een student uit een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *
 * /klassen/{klasgroepId}/vakken:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een klas toe aan een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naam:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een vak uit een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vakId:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *
 * /klassen/{klasgroepId}/taken:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle taken van een klasgroep
 *     tags: [Klassen, Taken]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *                 $ref: '#/components/schemas/Taak'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een taak toe aan een klasgroep
 *     tags: [Klassen, Taken]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               voormiddag:
 *                 type: string
 *               type:
 *                 type: string
 *               titel:
 *                 type: string
 *               beschrijving:
 *                 type: string
 *               deadline:
 *                 type: string
 *               weging:
 *                 type: number
 *               vak:
 *                 type: string
 *               isGepubliceerd:
 *                 type: boolean
 *               bijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taak'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *
 */
router
  .get("/", isAuth, getKlasgroepen)
  .post("/", isAuth, isDocent, addKlasgroep)
  .get("/:klasgroepId", isAuth, hasAccess, getKlasgroep)
  .post(
    "/:klasgroepId/studenten",
    isAuth,
    isDocent,
    isUnique,
    pushStudentToKlasgroep
  )
  .patch(
    "/:klasgroepId/studenten",
    isAuth,
    isDocent,
    removeStudentFromKlasgroep
  )
  .post("/:klasgroepId/vakken", isAuth, isDocent, isUnique, pushVakToKlasgroep)
  .patch("/:klasgroepId/vakken", isAuth, isDocent, removeVakFromKlasgroep)
  .get("/:klasgroepId/taken", isAuth, hasAccess, getTaken)
  .post("/:klasgroepId/taken", isAuth, isDocent, addTaak);

export default router;
