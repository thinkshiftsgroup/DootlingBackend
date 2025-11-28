import { Request, Response, NextFunction } from "express";

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Handle Prisma errors
      if (err.code === 'P2002') {
        const error = new Error('A record with this information already exists');
        (error as any).statusCode = 409;
        return next(error);
      }
      if (err.code === 'P2025') {
        const error = new Error('Record not found');
        (error as any).statusCode = 404;
        return next(error);
      }
      if (err.code === 'P2003') {
        const error = new Error('Foreign key constraint failed');
        (error as any).statusCode = 400;
        return next(error);
      }
      
      const error = new Error(err.message || err);
      (error as any).statusCode = err.statusCode || 500;
      next(error);
    });

export default asyncHandler;
