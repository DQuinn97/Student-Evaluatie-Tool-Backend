import express from "express";
import {
  getInzending,
  getInzendingen,
  updateInzending,
} from "../controllers/inzendingController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";
import { addGradering } from "../controllers/graderingController";
import { file, file_uploads_student } from "../middleware/multerMiddleware";

const router = express.Router();
/**
 * @swagger
 * /inzendingen:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Krijg alle inzendingen van de huidig ingelogde gebruiker
 *     tags: [Inzendingen]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Inzending'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /inzendingen/{inzendingId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een inzending op
 *     tags: [Inzendingen]
 *     parameters:
 *       - name: inzendingId
 *         in: path
 *         description: ID van de op te vragen inzending
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inzending'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een inzending
 *     tags: [Inzendingen]
 *     parameters:
 *       - name: inzendingId
 *         in: path
 *         description: ID van de te wijzigen inzending
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
 *               git:
 *                 type: string
 *               live:
 *                 type: string
 *               beschrijving:
 *                 type: string
 *               bijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *               nieuweBijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Inzending bijgewerkt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inzending'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /inzendingen/{inzendingId}/gradering:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een gradering toe aan een inzending
 *     tags: [Inzendingen, Graderingen]
 *     parameters:
 *       - name: inzendingId
 *         in: path
 *         description: ID van de inzending waarop de gradering moet worden toegevoegd
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
 *               score:
 *                 type: number
 *                 minimum: 0
 *               maxscore:
 *                 type: number
 *                 minimum: 1
 *                 default: 100
 *               feedback:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Gradering toegevoegd
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gradering'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 */
router
  .get("/", isAuth, getInzendingen)
  .get("/:inzendingId", isAuth, hasAccess, getInzending)
  .patch(
    "/:inzendingId",
    isAuth,
    hasAccess,
    file.any(),
    file_uploads_student,
    updateInzending
  )
  .post("/:inzendingId/gradering", isAuth, isDocent, addGradering);

export default router;
