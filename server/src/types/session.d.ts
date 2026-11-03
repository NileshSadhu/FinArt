import "express-session";
import "passport";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
      countryCode: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}
