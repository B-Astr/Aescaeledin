// backend/src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
      role: string;
      name?: string | null;
      picture?: string | null;
      step?: string | null;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
