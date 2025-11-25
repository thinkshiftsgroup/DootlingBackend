import "express-session";

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
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
