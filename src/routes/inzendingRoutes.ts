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
 *       - bearerAuth: []
 *     summary: Krijg alle inzendingen van de huidig ingelogde gebruiker
 *     operationId: getInzendingen
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
 *       - bearerAuth: []
 *     summary: Vraag een inzending op
 *     operationId: getInzending
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
 *       - bearerAuth: []
 *     summary: Update een inzending
 *     operationId: updateInzending
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
 *                 example: github.com/gebruiker/repo
 *               live:
 *                 type: string
 *                 example: todo-app-van-gebruiker.surge.sh
 *               beschrijving:
 *                 type: string
 *                 example: ""
 *               bijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
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
 *       - bearerAuth: []
 *     summary: "[Docent] Voeg een gradering toe aan een inzending"
 *     operationId: addGradering
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
 *                 example: 56.8
 *               feedback:
 *                 type: string
 *                 example: "kan beter!"
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
