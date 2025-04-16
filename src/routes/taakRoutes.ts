import express from "express";
import {
  getAlleTaken,
  getTaak,
  updateTaak,
  dupliceerTaak,
  deleteTaak,
  getAverage,
} from "../controllers/taakController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";
import {
  addInzending,
  getInzendingenPerTaak,
} from "../controllers/inzendingController";
import { isUnique } from "../middleware/uniqueMiddleware";
import {
  file,
  file_uploads_docent,
  file_uploads_student,
} from "../middleware/multerMiddleware";

const router = express.Router();
/**
 * @swagger
 * "/taken":
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: "[Docent] Vraag alle taken op"
 *     operationId: getAlleTaken
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
 *        $ref: '#/components/responses/Unauthorized'
 *       '403':
 *        $ref: '#/components/responses/Unauthorized'
 *
 * "/taken/{taakId}":
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een taak op
 *     operationId: getTaak
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
 *        $ref: '#/components/responses/Unauthorized'
 *       '403':
 *        $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *        $ref: '#/components/responses/PageNotFound'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: "[Docent] Wijzig een taak"
 *     operationId: updateTaak
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
 *               maxScore:
 *                 type: number
 *               vak:
 *                 type: string
 *               isGepubliceerd:
 *                 type: boolean
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taak'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   delete:
 *     security:
 *       - cookieAuth: []
 *     summary: "[Docent] Verwijder een taak"
 *     operationId: deleteTaak
 *     tags: [Taken]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de te verwijderen taak
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Taak verwijderd
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taak'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * "/taken/{taakId}/score":
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag de gemiddelde score van een taak op
 *     operationId: getAverage
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
 *               type: number
 *       '401':
 *        $ref: '#/components/responses/Unauthorized'
 *       '403':
 *        $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *        $ref: '#/components/responses/PageNotFound'
 *
 * "/taken/{taakId}/dupliceer":
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: "[Docent] Dupliceer een taak"
 *     operationId: dupliceerTaak
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
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * "/taken/{taakId}/inzendingen":
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een inzending toe aan de taak
 *     operationId: addInzending
 *     tags: [Taken, Inzendingen]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de te dupliceren taak
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taak'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *       '409':
 *         $ref: '#/components/responses/BadRequest_Duplicate'
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: "[Docent] Vraag alle inzendingen van een taak op"
 *     operationId: getInzendingenPerTaak
 *     tags: [Taken, Inzendingen]
 *     parameters:
 *       - name: taakId
 *         in: path
 *         description: ID van de taak
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
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 */
router
  .get("/", isAuth, isDocent, getAlleTaken)
  .get("/:taakId", isAuth, hasAccess, getTaak)
  .patch(
    "/:taakId",
    isAuth,
    isDocent,
    file.any(),
    file_uploads_docent,
    updateTaak
  )
  .post("/:taakId/dupliceer", isAuth, isDocent, dupliceerTaak)
  .delete("/:taakId", isAuth, isDocent, deleteTaak)
  .get("/:taakId/inzendingen", isAuth, isDocent, getInzendingenPerTaak)
  .post(
    "/:taakId/inzendingen",
    isAuth,
    hasAccess,
    isUnique,
    file.any(),
    file_uploads_student,
    addInzending
  )
  .get("/:taakId/score", isAuth, hasAccess, getAverage);

export default router;
