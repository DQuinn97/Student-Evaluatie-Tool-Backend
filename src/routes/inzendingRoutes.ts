import express from "express";
import {
  getInzending,
  getInzendingen,
  updateInzending,
} from "../controllers/inzendingController";
import { hasAccess, isAuth } from "../middleware/authMiddleware";

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
 *
 * /inzendingen/{inzendingId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een inzending op
 *     tags: [Inzendingen]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inzending'
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een inzending
 *     tags: [Inzendingen]
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
 *                   format: binary
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inzending'
 *       '401':
 *         description: Gebruiker is niet ingelogd
 *
 */
router
  .get("/", isAuth, getInzendingen)
  .get("/:inzendingId", isAuth, hasAccess, getInzending)
  .patch("/:inzendingId", isAuth, hasAccess, updateInzending);

export default router;
