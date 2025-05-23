import express from "express";
import {
  register,
  login,
  logout,
  resetWachtwoordRequest,
  resetWachtwoord,
  authTest,
  authorize,
} from "../controllers/authController";
import { isAuth } from "../middleware/authMiddleware";

const router = express.Router();
/**
 * @swagger
 * "/auth/register":
 *   post:
 *     summary: Registreer een gebruiker met een random wachtwoord per mail
 *     operationId: register
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@mail.com
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol geregistreerd, wachtwoord per mail verzonden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gebruiker succesvol geregistreerd, wachtwoord per mail verzonden
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *
 * /auth/authorize:
 *   post:
 *     summary: Authoriseer een gebruiker voor login
 *     operationId: authorize
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@mail.com
 *               wachtwoord:
 *                 type: string
 *                 example: ditiseenWachtwoord123!
 *               code_challenge:
 *                 type: string
 *                 example: abcde12345
 *               redirect_url:
 *                 type: string
 *                 example: '/login'
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol ingelogd
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirect:
 *                   type: string
 *                   example: '/login/abcdefg.hijklmnop.qrstuvw.xyz'
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *
 * /auth/login:
 *   post:
 *     summary: Log een gebruiker in
 *     operationId: login
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: authenticatie token
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code_verifier:
 *                 type: string
 *                 example: xyz-abcde12345
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol ingelogd
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gebruiker succesvol ingelogd
 *                 token:
 *                   type: string
 *                   example: abcdefg.hijklmnop.qrstuvw.xyz
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *
 * /auth/logout:
 *   post:
 *     deprecated: true
 *     summary: Log de huidige gebruiker uit
 *     operationId: logout
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol uitgelogd
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wachtwoord succesvol uitgelogd
 *
 * /auth/reset/request:
 *   post:
 *     summary: Stuur een wachtwoord reset link per mail
 *     operationId: resetWachtwoordRequest
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@mail.com
 *               reset_link:
 *                 type: string
 *                 example: https://student-evaluatie-tool.surge.sh/reset
 *     responses:
 *       '200':
 *         description: Geen herkende gebruiker
 *       '201':
 *         description: Wachtwoord reset link per mail verzonden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wachtwoord reset link per mail verzonden
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *
 * /auth/reset:
 *   post:
 *     summary: Reset een gebruikers wachtwoord
 *     operationId: resetWachtwoord
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wachtwoord:
 *                 type: string
 *                 example: ditiseenWactwoord123!
 *               resetToken:
 *                 type: string
 *                 example: resetToken
 *     responses:
 *       '200':
 *         description: Wachtwoord succesvol gereset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wachtwoord succesvol gereset
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /auth/test:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Test of de gebruiker kan inloggen
 *     description: >
 *       Test of de gebruiker kan inloggen door een auth-only route aan te spreken; <br>
 *         - 200 = gebruiker kan inloggen <br>
 *         - 401 = gebruiker kan niet inloggen
 *     operationId: authTest
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Gebruiker kan inloggen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gebruiker kan inloggen
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router
  .post("/register", register)
  .post("/login", login)
  .post("/authorize", authorize)
  .post("/logout", logout)
  .post("/reset/request", resetWachtwoordRequest)
  .post("/reset", resetWachtwoord)
  .get("/test", isAuth, authTest);

export default router;
