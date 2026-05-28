// backend/src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

type DecodedToken = {
  id: number;
  email: string;
  role: string;
  name?: string | null;
  picture?: string | null;
  step?: string | null;
};

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({
        error: "Token requerido",
      });
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string") {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    const payload = decoded as DecodedToken;

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
      step: payload.step ?? null,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
}

export function requireFullyAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({
        error: "Token requerido",
      });
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string") {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    const payload = decoded as DecodedToken;

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
      step: payload.step ?? null,
    };

    if (!req.user || req.user.step !== "authenticated") {
      return res.status(401).json({
        error: "Autenticación incompleta. OTP requerido.",
      });
    }

    return next();
  } catch (_error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
}
