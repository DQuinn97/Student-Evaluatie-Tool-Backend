import express from "express";
import {
  getHelloWorld,
  getTodos,
  addTodo,
  updateTodo,
} from "../controllers/exampleController";

const router = express.Router();

router
  .get("/test", getHelloWorld)
  .get("/todos", getTodos)
  .post("/todos", addTodo)
  .patch("/todos/:id", updateTodo);

export default router;
