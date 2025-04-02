import express from "express";
import {
  register,
  login,
  logout,
  resetWachtwoordRequest,
  resetWachtwoord,
} from "../controllers/authController";

const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .post("/reset/request", resetWachtwoordRequest)
  .post("/reset", resetWachtwoord);

export default router;
