import express from "express";
import {
  addDag,
  addVerslag,
  deleteDag,
  deleteDagboek,
  deleteVerslag,
  getDag,
  getDagboek,
  getDagboek2,
  getVerslag,
  updateDag,
  updateVerslag,
} from "../controllers/stagedagboekController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";
import { isUnique } from "../middleware/uniqueMiddleware";
import { file, file_uploads_student } from "../middleware/multerMiddleware";

const router = express.Router();
/**
 * @swagger
 * /dagboek/{dagboekId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een stagedagboek op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagboekId
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
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   delete:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een stagedagboek op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagboekId
 *         in: path
 *         description: ID van het te verwijderen stagedagboek
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: 'Stagedagboek verwijderd'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedagboek'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /dagboek/{klasgroepId}/{studentId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een stagedagboek op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de klasgroep gerelateerd aan stagedagboek
 *         required: true
 *         schema:
 *           type: string
 *       - name: studentId
 *         in: path
 *         description: ID van de student gerelateerd aan stagedagboek
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedagboek'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /dagboek/dag/{dagId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een stagedag op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagId
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
 *       '401':
 *        $ref: '#/components/responses/Unauthorized'
 *       '403':
 *        $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een stagedag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagId
 *         in: path
 *         description: ID van het te updaten stagedag
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
 *               nieuweBijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Stagedag bijgewerkt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedag'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   delete:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een stagedag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagId
 *         in: path
 *         description: ID van het te verwijderen stagedag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Stagedag verwijderd
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedag'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /dagboek/verslag/{verslagId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een stageverslag op
 *     tags: [Dagboek]
 *     parameters:
 *       - name: verslagId
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
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Update een stageverslag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: verslagId
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
 *               nieuweBijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Stageverslag bijgewerkt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stageverslag'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   delete:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een stageverslag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: verslagId
 *         in: path
 *         description: ID van het te verwijderen stageverslag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Stageverslag verwijderd
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stageverslag'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /dagboek/{dagboekId}/dag:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een nieuwe stagedag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagboekId
 *         in: path
 *         description: ID van het dagboek waar de dag in aangemaakt word
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
 *               nieuweBijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '201':
 *         description: Stagedag aangemaakt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stagedag'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /dagboek/{dagboekId}/verslag:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een nieuw stageverslag
 *     tags: [Dagboek]
 *     parameters:
 *       - name: dagboekId
 *         in: path
 *         description: ID van het dagboek waar het verslag in aangemaakt word
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
 *               nieuweBijlagen:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '201':
 *         description: Stageverslag aangemaakt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stageverslag'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *       '409':
 *         $ref: '#/components/responses/BadRequest_Duplicate'
 *
 */
router
  .get("/dag/:dagId", isAuth, hasAccess, getDag)
  .get("/verslag/:verslagId", isAuth, hasAccess, getVerslag)
  .patch(
    "/verslag/:verslagId",
    isAuth,
    hasAccess,
    file.any(),
    file_uploads_student,
    updateVerslag
  )
  .patch(
    "/dag/:dagId",
    isAuth,
    hasAccess,
    file.any(),
    file_uploads_student,
    updateDag
  )
  .delete("/dag/:dagId", isAuth, hasAccess, deleteDag)
  .delete("/verslag/:verslagId", isAuth, hasAccess, deleteVerslag)
  .get("/:dagboekId", isAuth, hasAccess, getDagboek)
  .delete("/:dagboekId", isAuth, hasAccess, deleteDagboek)
  .post(
    "/:dagboekId/verslag",
    isAuth,
    hasAccess,
    isUnique,
    file.any(),
    file_uploads_student,
    addVerslag
  )
  .post(
    "/:dagboekId/dag",
    isAuth,
    hasAccess,
    file.any(),
    file_uploads_student,
    addDag
  )
  .get("/:klasgroepId/:studentId", isAuth, hasAccess, getDagboek2);

export default router;
