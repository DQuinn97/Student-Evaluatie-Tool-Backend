import express from "express";
import {
  addBijlagen,
  deleteBijlage,
  getBijlagen,
} from "../controllers/bijlageController";
import { isAuth, isDocent } from "../middleware/authMiddleware";
import { file, file_uploads_docent } from "../middleware/multerMiddleware";

const router = express.Router();
/**
 * @swagger
 * /bijlagen:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle bijlagen op
 *     tags: [Bijlagen]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Bijlage'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: [Docent] Voeg een bijlage toe (deze wordt wel terug verwijderd als ze niet word gebruikt)
 *     tags: [Bijlagen]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nieuweBijlagen:
 *                 type: string
 *                 format: binary
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /bijlagen/{bijlageId}:
 *   delete:
 *     security:
 *       - cookieAuth: []
 *     summary: [Docent] Verwijder een bijlage
 *     tags: [Bijlagen]
 *     parameters:
 *       - name: bijlageId
 *         in: path
 *         description: ID van de te verwijderen bijlage
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bijlage'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 */
router
  .get("/", isAuth, getBijlagen)
  .post("/", isAuth, isDocent, file.any(), file_uploads_docent, addBijlagen)
  .delete("/:bijlageId", isAuth, isDocent, deleteBijlage);

export default router;
