import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authApiLimiter } from "../middlewares/rateLimiter.js";
import {
  createTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  cancelTransaction,
  deleteTransaction,
  exportTransactions,
  importTransactions,
} from "../controllers/transaction.controller.js";

const transactionRoute = Router();

transactionRoute.use(requireAuth, authApiLimiter);

transactionRoute.post("/import", importTransactions);
transactionRoute.post("/", createTransaction);
transactionRoute.get("/export", exportTransactions);
transactionRoute.get("/", getAllTransactions);
transactionRoute.get("/:id", getTransaction);
transactionRoute.patch("/:id", updateTransaction);
transactionRoute.post("/:id/cancel", cancelTransaction);
transactionRoute.delete("/:id", deleteTransaction);

export default transactionRoute;
