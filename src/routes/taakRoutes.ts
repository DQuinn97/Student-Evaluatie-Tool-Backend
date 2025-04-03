import express from "express";
import {
  getAlleTaken,
  getTaak,
  updateTaak,
  dupliceerTaak,
  deleteTaak,
} from "../controllers/taakController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";

const router = express.Router();
/**
 * @swagger
 * "/taken/":
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle taken op
 *     tags: [Taken]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Taak'
 *       '401':
 *        description: Geen herkende gebruiker / docent
 *
 * "/taken/{taakId}":
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een taak op
 *     tags: [Taken]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de op te vragen taak
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taak'
 *       '401':
 *        description: Geen herkende gebruiker / docent
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Wijzig een taak
 *     tags: [Taken]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de te wijzigen taak
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
 *   delete:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een taak
 *     tags: [Taken]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de te verwijderen taak
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Taak verwijderd
 *       '401':
 *         description: Geen herkende gebruiker / docent
 *
 * "/taken/{taakId}/dupliceer":
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Dupliceer een taak
 *     tags: [Taken]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de te dupliceer taak
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
 *               klasgroepId:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taak'
 *       '401':
 *         description: Geen herkende gebruiker / docent
 */
router
  .get("/", isAuth, isDocent, getAlleTaken)
  .get("/:taakId", isAuth, hasAccess, getTaak)
  .patch("/:taakId", isAuth, isDocent, updateTaak)
  .post("/:taakId/dupliceer", isAuth, isDocent, dupliceerTaak)
  .delete("/:taakId", isAuth, isDocent, deleteTaak);

export default router;
