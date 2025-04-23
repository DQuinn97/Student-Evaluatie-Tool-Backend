import express from "express";
import {
  getGradering,
  updateGradering,
} from "../controllers/graderingController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";

const router = express.Router();
/**
 * @swagger
 * /graderingen/{graderingId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Vraag een gradering op
 *     operationId: getGradering
 *     tags: [Graderingen]
 *     parameters:
 *       - name: graderingId
 *         in: path
 *         description: ID van de op te vragen gradering
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Gradering'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: "[Docent] Update een gradering"
 *     operationId: updateGradering
 *     tags: [Graderingen]
 *     parameters:
 *       - name: graderingId
 *         in: path
 *         description: ID van de te wijzigen gradering
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
 *                 example: "Kan beter!"
 *     responses:
 *       '200':
 *         description: Gradering bijgewerkt
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
 *
 */
router
  .get("/:graderingId", isAuth, hasAccess, getGradering)
  .patch("/:graderingId", isAuth, isDocent, updateGradering);

export default router;
