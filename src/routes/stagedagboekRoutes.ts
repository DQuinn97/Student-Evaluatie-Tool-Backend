import express from "express";
import {
  addDag,
  addVerslag,
  deleteDag,
  deleteVerslag,
  getDag,
  getDagboek,
  getVerslag,
  updateDag,
  updateVerslag,
} from "../controllers/stagedagboekController";

const router = express.Router();

router
  .get("/", getDagboek)
  .get("/dag/:id", getDag)
  .get("/verslag/:id", getVerslag)
  .post("/verslag/nieuw", addVerslag)
  .post("/dag/nieuw", addDag)
  .patch("/verslag/:id/edit", updateVerslag)
  .patch("/dag/:id/edit", updateDag)
  .delete("/dag/:id", deleteDag)
  .delete("/verslag/:id", deleteVerslag);

export default router;
