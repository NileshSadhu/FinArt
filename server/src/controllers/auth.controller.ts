import type { Request, Response } from "express";
import { userRepository } from "../db/repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserId } from "../utils/params.js";

export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
    };

    const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
    return res.redirect(`${clientOrigin}/auth/callback?status=success`);
  },
);

export const signOut = asyncHandler(async (req: Request, res: Response) => {
  await new Promise<void>((resolve, reject) =>
    req.logout((err) => (err ? reject(err) : resolve())),
  );
  await new Promise<void>((resolve, reject) =>
    req.session.destroy((err) => (err ? reject(err) : resolve())),
  );
  res.clearCookie("connect.sid");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Signed out successfully"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(res);

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      "User fetched",
    ),
  );
});
