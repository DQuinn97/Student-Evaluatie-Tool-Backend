import express from "express";
import {
  getInzending,
  getInzendingen,
  updateInzending,
} from "../controllers/inzendingController";
import { hasAccess, isAuth } from "../middleware/authMiddleware";

const router = express.Router();

router
  .get("/", isAuth, getInzendingen)
  .get("/:inzendingId", isAuth, hasAccess, getInzending)
  .patch("/:inzendingId", isAuth, hasAccess, updateInzending);

export default router;
