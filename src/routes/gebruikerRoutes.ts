import express from "express";
import {
  setGebruikerData,
  setGebruikerFoto,
  getAuthGebruiker,
} from "../controllers/gebruikerController";
import { isAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/multerMiddleware";

const router = express.Router();

router
  .get("/", isAuth, getAuthGebruiker)
  .post("/data", isAuth, setGebruikerData)
  .post("/foto", isAuth, upload.single("foto"), setGebruikerFoto);

export default router;
