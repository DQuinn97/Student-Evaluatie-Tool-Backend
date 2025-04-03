import express from "express";
import {
  addDag,
  addVerslag,
  deleteDag,
  deleteVerslag,
  getDag,
  getDagboek,
  getVerslag,
  updateDag,
  updateVerslag,
} from "../controllers/stagedagboekController";

const router = express.Router();
/**
 * @swagger
 * /dagboek/{id}:
 *   get:
 *     summary: Vraag een stagedagboek op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID van het op te vragen stagedagboek
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedagboek'
 *
 * /dagboek/dag/{id}:
 *   get:
 *     summary: Vraag een stagedag op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID van de op te vragen stagedag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedag'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een stagedag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID van het te updaten stagedag
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stagedag'
 *     responses:
 *       '200':
 *         description: Stagedag succesvol geupdate
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 * /dagboek/verslag/{id}:
 *   get:
 *     summary: Vraag een stageverslag op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID van het op te vragen stageverslag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stageverslag'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een stageverslag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID van het te updaten stageverslag
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
 *               datum:
 *                 type: string
 *                 format: date
 *               voormiddag:
 *                 type: string
 *               namiddag:
 *                 type: string
 *               tools:
 *                 type: string
 *               resultaat:
 *                 type: string
 *               bijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Stageverslag succesvol geupdate
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 * /dagboek/dag/nieuw:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een nieuwe stagedag
 *     tags: [Dagboek]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stagedag'
 *     responses:
 *       '200':
 *         description: Stagedag succesvol aangemaakt
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 * /dagboek/verslag/nieuw:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een nieuw stageverslag
 *     tags: [Dagboek]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               datum:
 *                 type: string
 *                 format: date
 *               stagebedrijf:
 *                 type: string
 *               uitvoering:
 *                 type: string
 *               ervaring:
 *                 type: string
 *               bijgeleerd:
 *                 type: string
 *               conclusie:
 *                 type: string
 *               score:
 *                 type: number
 *               reflectie:
 *                 type: string
 *               bijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Stageverslag succesvol aangemaakt
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 */
router
  .get("/:id", getDagboek)
  .get("/dag/:id", getDag)
  .get("/verslag/:id", getVerslag)
  .post("/verslag/nieuw", addVerslag)
  .post("/dag/nieuw", addDag)
  .patch("/verslag/:id", updateVerslag)
  .patch("/dag/:id", updateDag)
  .delete("/dag/:id", deleteDag)
  .delete("/verslag/:id", deleteVerslag);

export default router;
