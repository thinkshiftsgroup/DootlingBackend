import "express-session";
import { Store } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string | null;
        isVerified: boolean;
        userType: string;
      };
      store?: Store;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
