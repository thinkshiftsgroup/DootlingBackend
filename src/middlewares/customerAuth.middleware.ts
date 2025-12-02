import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_UNSAFE_DEFAULT_SECRET";

export const customerProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; scope?: string };
    const customer = await prisma.customer.findUnique({
      where: { id: Number(decoded.id) },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!customer) {
      res.status(401).json({ message: "Not authorized, customer not found" });
      return;
    }
    (req as any).customer = customer;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
