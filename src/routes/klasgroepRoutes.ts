import express from "express";
import {
  addKlasgroep,
  getKlasgroep,
  getKlasgroepen,
  pushToKlasgroep,
  removeFromKlasgroep,
} from "../controllers/klasgroepController";
import { isAuth, isDocent } from "../middleware/authMiddleware";

const router = express.Router();

router
  .get("/", getKlasgroepen)
  .post("/", isAuth, isDocent, addKlasgroep)
  .get("/:id", getKlasgroep)
  .post("/:id/studenten", isAuth, isDocent, pushToKlasgroep)
  .patch("/:id/studenten", isAuth, isDocent, removeFromKlasgroep);

export default router;
