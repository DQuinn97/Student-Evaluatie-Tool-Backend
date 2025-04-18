// Imports
import "dotenv/config";
import cors from "cors";
import express from "express";
import { notFound } from "./controllers/notFoundController";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";
import stagedagboekRoutes from "./routes/stagedagboekRoutes";
import authRoutes from "./routes/authRoutes";
import gebruikerRoutes from "./routes/gebruikerRoutes";
import klasgroepRoutes from "./routes/klasgroepRoutes";
import taakRoutes from "./routes/taakRoutes";
import inzendingenRoutes from "./routes/inzendingRoutes";
import graderingRoutes from "./routes/graderingRoutes";
import { NextFunction, Request, Response } from "./utils/types";

// Variables
const app = express();
const PORT = process.env.PORT || 3000;

const cors_allowlist = [
  process.env.ORIGIN as string,
  "https://qr-dev-testing.surge.sh",
];
// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (cors_allowlist.indexOf(origin as string) !== -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => res.redirect("/docs"));
app.use("/api/dagboek", stagedagboekRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profiel", gebruikerRoutes);
app.use("/api/klassen", klasgroepRoutes);
app.use("/api/taken", taakRoutes);
app.use("/api/inzendingen", inzendingenRoutes);
app.use("/api/graderingen", graderingRoutes);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { customCssUrl: "/theme-material.css" })
);
app.all("*", notFound);

// Database connection
try {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Database connection OK");
} catch (err) {
  console.error(err);
  process.exit(1);
}

// Server Listening
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}! 🚀`);
});
