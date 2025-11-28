import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_UNSAFE_DEFAULT_SECRET";



const handleTokenVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType?: "admin" | "superadmin"
): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

      const user = await prisma.user.findUnique({
        where: { id: Number(decoded.id) },
        select: {
          id: true,
          email: true,
          username: true,
          isVerified: true,
          userType: true,
        },
      });

      if (!user) {
        res.status(401).json({ message: "Not authorized, user not found" });
        return;
      }

      req.user = user;

      if (userType) {
        if (
          (userType === "admin" &&
            (user.userType === "admin" || user.userType === "superadmin")) ||
          (userType === "superadmin" && user.userType === "superadmin")
        ) {
          next();
        } else {
          res.status(403).json({
            message: `Not authorized, requires ${userType} access`,
          });
        }
      } else {
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }
};

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return handleTokenVerification(req, res, next);
};

export const adminProtect = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return handleTokenVerification(req, res, next, "admin");
};

export const superadminProtect = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return handleTokenVerification(req, res, next, "superadmin");
};

export const optionalProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await prisma.user.findUnique({
        where: { id: Number(decoded.id) },
        select: {
          id: true,
          email: true,
          username: true,
          isVerified: true,
          userType: true,
        },
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error("Token verification failed (optional):", error);
    }
  }
  next();
};

// Aliases for consistency
export const authenticate = protect;
export const authenticateToken = protect;
