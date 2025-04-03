import express from "express";
import {
  getAlleTaken,
  getTaak,
  updateTaak,
  dupliceerTaak,
  deleteTaak,
} from "../controllers/taakController";
import { hasAccess, isAuth, isDocent } from "../middleware/authMiddleware";

const router = express.Router();

router
  .get("/", isAuth, isDocent, getAlleTaken)
  .get("/:taakId", isAuth, hasAccess, getTaak)
  .patch("/:taakId", isAuth, isDocent, updateTaak)
  .post("/:taakId/dupliceer", isAuth, isDocent, dupliceerTaak)
  .delete("/:taakId", isAuth, isDocent, deleteTaak);

export default router;
