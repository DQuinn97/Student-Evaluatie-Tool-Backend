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
 *       - cookieAuth: []
 *     summary: Vraag een gradering op
 *     tags: [Graderingen]
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
 *       - cookieAuth: []
 *     summary: Update een gradering
 *     tags: [Graderingen]
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
