import { Router } from "express";
import authRoute from "./authRoute.js";
import accountRoute from "./accountRoute.js";
import transactionRoute from "./transactionRoute.js";
import categoryRoute from "./categoryRoute.js";
import holidayRoute from "./holidayRoute.js";

const mainRoute = Router();

mainRoute.get("/", (req, res) => {
  res.send("Welcome to the FinArt API!");
});

mainRoute.use("/auth", authRoute);
mainRoute.use("/accounts", accountRoute);
mainRoute.use("/transactions", transactionRoute);
mainRoute.use("/categories", categoryRoute);
mainRoute.use("/holidays", holidayRoute);

export default mainRoute;
