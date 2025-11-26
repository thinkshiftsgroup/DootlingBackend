import { Request, Response, NextFunction } from "express";

const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      const error = new Error(err.message || err);
      (error as any).statusCode = err.statusCode || 400;
      next(error);
    });

export default asyncHandler;
