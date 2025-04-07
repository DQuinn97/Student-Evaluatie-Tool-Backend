// Imports
import "dotenv/config";
import cors from "cors";
import express from "express";
import { notFound } from "./controllers/notFoundController";
import testRoutes from "./routes/exampleRoutes";
import { helloMiddleware } from "./middleware/exampleMiddleware";
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

// Variables
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.redirect("/docs"));
app.use("/api/dagboek", stagedagboekRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profiel", gebruikerRoutes);
app.use("/api/klassen", klasgroepRoutes);
app.use("/api/taken", taakRoutes);
app.use("/api/inzendingen", inzendingenRoutes);
app.use("/api/graderingen", graderingRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
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
