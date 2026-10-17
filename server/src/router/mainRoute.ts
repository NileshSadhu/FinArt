import { Router } from "express";
import authRoute from "./authRoute.js";
import accountRoute from "./accountRoute.js";
import transactionRoute from "./transactionRoute.js";

const mainRoute = Router();

mainRoute.get("/", (req, res) => {
  res.send("Welcome to the FinArt API!");
});

mainRoute.use("/auth", authRoute);
mainRoute.use("/accounts", accountRoute);
mainRoute.use("/transactions", transactionRoute);

export default mainRoute;
