import express from "express";
import {
  getGradering,
  updateGradering,
} from "../controllers/graderingController";
import { hasAccess, isAuth } from "../middleware/authMiddleware";

const router = express.Router();

router
  .get("/:graderingId", isAuth, hasAccess, getGradering)
  .patch("/:graderingId", isAuth, hasAccess, updateGradering);

export default router;
