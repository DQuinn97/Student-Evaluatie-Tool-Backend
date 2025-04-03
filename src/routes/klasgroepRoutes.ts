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

const router = express.Router();
/**
 * @swagger
 * /klassen:
 *   get:
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
 * /klassen/{id}:
 *   get:
 *     summary: Vraag een klasgroep op
 *     tags: [Klassen]
 *     parameters:
 *       - name: id
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
 * /klassen/{id}/studenten:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een student toe aan een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: id
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
 *       - name: id
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
 * /klassen/{id}/vakken:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een klas toe aan een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: id
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
 *       - name: id
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
 */
router
  .get("/", isAuth, getKlasgroepen)
  .post("/", isAuth, isDocent, addKlasgroep)
  .get("/:klasgroepId", isAuth, hasAccess, getKlasgroep)
  .post("/:klasgroepId/studenten", isAuth, isDocent, pushStudentToKlasgroep)
  .patch(
    "/:klasgroepId/studenten",
    isAuth,
    isDocent,
    removeStudentFromKlasgroep
  )
  .post("/:klasgroepId/vakken", isAuth, isDocent, pushVakToKlasgroep)
  .patch("/:klasgroepId/vakken", isAuth, isDocent, removeVakFromKlasgroep)
  .get("/:klasgroepId/taken", isAuth, hasAccess, getTaken)
  .post("/:klasgroepId/taken", isAuth, isDocent, addTaak);

export default router;
