// backend/src/middleware/requireRole.middleware.ts
import type { Request, Response, NextFunction } from "express";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No autorizado",
      });
    }

    return next();
  };
}
