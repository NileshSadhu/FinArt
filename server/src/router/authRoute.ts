import { Router } from "express";
import passport from "../auth/passport.js";
import {
  googleCallback,
  signOut,
  getMe,
  updateCountry,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  authInitLimiter,
  authApiLimiter,
} from "../middlewares/rateLimiter.js";

const authRoute = Router();

authRoute.get(
  "/google",
  authInitLimiter,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_ORIGIN ?? "http://localhost:5173"}/auth/callback?status=error`,
    session: true,
  }),
  googleCallback,
);

authRoute.post("/signout", authApiLimiter, requireAuth, signOut);
authRoute.get("/me", authApiLimiter, requireAuth, getMe);
authRoute.patch("/country", authApiLimiter, requireAuth, updateCountry);

export default authRoute;
