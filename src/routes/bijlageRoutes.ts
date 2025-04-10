import express from "express";
import {
  addBijlagen,
  deleteBijlage,
  getBijlagen,
} from "../controllers/bijlageController";
import { isAuth, isDocent } from "../middleware/authMiddleware";
import { file, file_uploads_docent } from "../middleware/multerMiddleware";

const router = express.Router();

router
  .get("/", isAuth, getBijlagen)
  .post("/", isAuth, isDocent, file.any(), file_uploads_docent, addBijlagen)
  .delete("/:bijlageId", isAuth, isDocent, deleteBijlage);

export default router;
