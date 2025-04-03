import express from "express";
import {
  register,
  login,
  logout,
  resetWachtwoordRequest,
  resetWachtwoord,
} from "../controllers/authController";

const router = express.Router();
/**
 * @swagger
 * "/auth/register":
 *   post:
 *     summary: Registreer een gebruiker met een random wachtwoord per mail
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
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol geregistreerd, wachtwoord per mail verzonden
 *
 * /auth/login:
 *   post:
 *     summary: Log een gebruiker in
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
 *               wachtwoord:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol ingelogd
 *
 * /auth/logout:
 *   post:
 *     summary: Log de huidige gebruiker uit
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Gebruiker succesvol uitgelogd
 *
 * /auth/reset/request:
 *   post:
 *     summary: Stuur een wachtwoord reset link per mail
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
 *               reset_link:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Wachtwoord reset link per mail verzonden
 *
 * /auth/reset:
 *   post:
 *     summary: Reset een gebruikers wachtwoord
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
 *               resetToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Wachtwoord succesvol gereset
 */
router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .post("/reset/request", resetWachtwoordRequest)
  .post("/reset", resetWachtwoord);

export default router;
