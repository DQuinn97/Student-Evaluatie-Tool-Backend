import express from "express";
import {
  getGebruikerById,
  getGebruikers,
} from "../controllers/gebruikerController";
import { isAuth, isDocent } from "../middleware/authMiddleware";
import { getInzendingenPerStudent } from "../controllers/inzendingController";

const router = express.Router();
/**
 * @swagger
 * /gebruikers:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: "[Docent] Geef alle gebruikers weer"
 *     operationId: getGebruikers
 *     tags: [Gebruikers]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Gebruiker'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /gebruikers/{gebruikerId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: "[Docent] Vraag een gebruiker op (duplicate)"
 *     operationId: getGebruikerById
 *     tags: [Gebruikers, Profiel]
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
 * /gebruikers/{gebruikerId}/inzendingen:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: "[Docent] Vraag alle inzendingen van een gebruiker op (duplicate)"
 *     operationId: getInzendingenPerStudent
 *     tags: [Gebruikers, Inzendingen]
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
  .get("/", isAuth, isDocent, getGebruikers)
  .get("/:gebruikerId", isAuth, isDocent, getGebruikerById)
  .get("/:gebruikedId/inzendingen", isAuth, isDocent, getInzendingenPerStudent);

export default router;
