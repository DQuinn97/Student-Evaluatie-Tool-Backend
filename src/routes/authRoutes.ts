import express from "express";
import {
  register,
  login,
  logout,
  resetWachtwoordRequest,
  resetWachtwoord,
  authTest,
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
 * /auth/login:
 *   post:
 *     summary: Log een gebruiker in
 *     operationId: login
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
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
 *
 * /auth/logout:
 *   post:
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
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; Path=/; HttpOnly
 *       '400':
 *         $ref: '#/components/responses/BadRequest_MissingField'
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
 */
router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .post("/reset/request", resetWachtwoordRequest)
  .post("/reset", resetWachtwoord)
  .post("/test", isAuth, authTest);

export default router;
