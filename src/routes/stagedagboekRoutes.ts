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
  .get("/dagboek", getDagboek)
  .get("/dagboek/dag/:id", getDag)
  .get("/dagboek/verslag/:id", getVerslag)
  .post("/dagboek/verslag/nieuw", addVerslag)
  .post("/dagboek/dag/nieuw", addDag)
  .patch("/dagboek/verslag/:id/edit", updateVerslag)
  .patch("/dagboek/dag/:id/edit", updateDag)
  .delete("/dagboek/dag/:id", deleteDag)
  .delete("/dagboek/verslag/:id", deleteVerslag);

export default router;
