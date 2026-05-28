// backend/src/lib/jwt.ts
import jwt from "jsonwebtoken";

type BaseUserPayload = {
  id: number;
  email: string;
  role: string;
};

type AccessTokenPayload = BaseUserPayload & {
  name?: string | null;
  picture?: string | null;
};

type PendingTokenPayload = BaseUserPayload & {
  step?: "otp_pending";
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido");
  }

  return secret;
}

// Token temporal: se usa después del login con Google y antes de verificar el OTP

export function signPendingToken(user: BaseUserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      step: "otp_pending",
    },
    getJwtSecret(),
    {
      expiresIn: "15m", 
    }
  );
}



// Token final de acceso que se entregará recién cuando Google mas OTP ya fueron validados

export function signAccessToken(user: AccessTokenPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? null,
      picture: user.picture ?? null,
      step: "authenticated",
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
}


// Verifica cualquier JWT firmado por la app

export function verifyToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, getJwtSecret());
}
