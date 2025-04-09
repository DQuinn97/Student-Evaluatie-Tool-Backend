import express from "express";
import {
  addKlasgroep,
  getKlasgroep,
  getKlasgroepen,
  pushStudentToKlasgroep,
  pushVakToKlasgroep,
  removeStudentFromKlasgroep,
  removeVakFromKlasgroep,
} from "../controllers/klasgroepController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";
import { getTaken, addTaak } from "../controllers/taakController";
import { isUnique } from "../middleware/uniqueMiddleware";
import {
  getKlasgroepDump,
  getGebruikerDump,
} from "../controllers/dumpController";
import {
  createAuthDagboek,
  getAuthDagboek,
} from "../controllers/stagedagboekController";

const router = express.Router();
/**
 * @swagger
 * /klassen:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle klasgroepen op
 *     tags: [Klassen]
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een nieuwe klasgroep aan
 *     tags: [Klassen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naam:
 *                 type: string
 *               beginjaar:
 *                 type: number
 *                 example: 2024
 *               eindjaar:
 *                 type: number
 *                 example: 2025
 *     responses:
 *       '201':
 *         description: Klasgroep aangemaakt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /klassen/{klasgroepId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag een klasgroep op
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de op te vragen klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /klassen/{klasgroepId}/dump:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: De totale data dump van een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de op te vragen klasgroep
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KlasgroepDump'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /klassen/{klasgroepId}/studenten:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een student toe aan een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *               studentId:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een student uit een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *               studentId:
 *                 type: string
 *     responses:
 *       '204':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /klassen/{klasgroepId}/studenten/{studentId}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: De totale data dump van een student in een klasgroep
 *     tags: [Klassen, Profiel]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de op te vragen klasgroep
 *         required: true
 *         schema:
 *           type: string
 *       - name: studentId
 *         in: path
 *         description: ID van de op te vragen student
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GebruikerDump'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /klassen/{klasgroepId}/vakken:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een klas toe aan een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *               naam:
 *                 type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *       '409':
 *         $ref: '#/components/responses/BadRequest_Duplicate'
 *   patch:
 *     security:
 *       - cookieAuth: []
 *     summary: Verwijder een vak uit een klasgroep
 *     tags: [Klassen]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *               vakId:
 *                 type: string
 *     responses:
 *       '204':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Klasgroep'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /klassen/{klasgroepId}/taken:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag alle taken van een klasgroep
 *     tags: [Klassen, Taken]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *                 $ref: '#/components/schemas/Taak'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Voeg een taak toe aan een klasgroep
 *     tags: [Klassen, Taken]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de te bewerken klasgroep
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
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Unauthorized_Resource'
 *       '404':
 *         $ref: '#/components/responses/PageNotFound'
 *
 * /klasgroepen/{klasgroepId}/dagboek:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Vraag het stagedagboek van de ingelogde gebruiker op voor deze klasgroep
 *     tags: [Klassen, Dagboek]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de klasgroep waarin het stagedagboek zit
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
 *   post:
 *     security:
 *       - cookieAuth: []
 *     summary: Maak een stagedagboek aan voor de ingelogde gebruiker op deze klasgroep
 *     tags: [Klassen, Dagboek]
 *     parameters:
 *       - name: klasgroepId
 *         in: path
 *         description: ID van de klasgroep waarin het stagedagboek moet worden aangemaakt
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Stagedagboek aangemaakt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: Stagedagboek aangemaakt
 *                 dagboek:
 *                   $ref: '#/components/schemas/Stagedagboek'
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
  .get("/", isAuth, getKlasgroepen)
  .post("/", isAuth, isDocent, addKlasgroep)
  .get("/:klasgroepId", isAuth, hasAccess, getKlasgroep)
  .get("/:klasgroepId/dump", isAuth, isDocent, getKlasgroepDump)
  .post(
    "/:klasgroepId/studenten",
    isAuth,
    isDocent,
    isUnique,
    pushStudentToKlasgroep
  )
  .patch(
    "/:klasgroepId/studenten",
    isAuth,
    isDocent,
    removeStudentFromKlasgroep
  )
  .get(
    "/:klasgroepId/studenten/:studentId/dump",
    isAuth,
    hasAccess,
    getGebruikerDump
  )
  .post("/:klasgroepId/vakken", isAuth, isDocent, isUnique, pushVakToKlasgroep)
  .patch("/:klasgroepId/vakken", isAuth, isDocent, removeVakFromKlasgroep)
  .get("/:klasgroepId/taken", isAuth, hasAccess, getTaken)
  .post("/:klasgroepId/taken", isAuth, isDocent, addTaak)
  .get("/:klasgroepId/dagboek", isAuth, hasAccess, getAuthDagboek)
  .post(
    "/:klasgroepId/dagboek",
    isAuth,
    hasAccess,
    isUnique,
    createAuthDagboek
  );

export default router;
