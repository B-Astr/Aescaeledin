// backend/src/lib/jwt.ts
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

type BaseUserPayload = {
  id: number;
  email: string;
  role: string;
};

type AccessTokenPayload = BaseUserPayload & {
  name?: string | null;
  picture?: string | null;
};

type TokenPayload = BaseUserPayload & {
  step: "otp_pending" | "authenticated";
  iat: number;
  exp: number;
};

const JWE_HEADER = {
  alg: "dir",
  enc: "A256GCM",
  typ: "JWT",
};

const PENDING_TOKEN_TTL_SECONDS = 15 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return Buffer.from(padded, "base64");
}

function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no esta definido");
  }

  return createHash("sha256").update(secret, "utf8").digest();
}

function createToken(
  user: BaseUserPayload,
  step: TokenPayload["step"],
  ttlSeconds: number
): string {
  const now = Math.floor(Date.now() / 1000);
  const protectedHeader = base64UrlEncode(JSON.stringify(JWE_HEADER));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const aad = Buffer.from(protectedHeader, "utf8");
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    step,
    iat: now,
    exp: now + ttlSeconds,
  };

  cipher.setAAD(aad);

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    protectedHeader,
    "",
    base64UrlEncode(iv),
    base64UrlEncode(ciphertext),
    base64UrlEncode(tag),
  ].join(".");
}

function decryptToken(token: string): TokenPayload {
  const parts = token.split(".");

  if (parts.length !== 5) {
    throw new Error("Token invalido");
  }

  const [protectedHeader, encryptedKey, encodedIv, encodedCiphertext, encodedTag] =
    parts;

  if (!protectedHeader || encryptedKey !== "" || !encodedIv || !encodedCiphertext || !encodedTag) {
    throw new Error("Token invalido");
  }

  const header = JSON.parse(base64UrlDecode(protectedHeader).toString("utf8"));

  if (header.alg !== JWE_HEADER.alg || header.enc !== JWE_HEADER.enc) {
    throw new Error("Token invalido");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    base64UrlDecode(encodedIv)
  );

  decipher.setAAD(Buffer.from(protectedHeader, "utf8"));
  decipher.setAuthTag(base64UrlDecode(encodedTag));

  const plaintext = Buffer.concat([
    decipher.update(base64UrlDecode(encodedCiphertext)),
    decipher.final(),
  ]);
  const payload = JSON.parse(plaintext.toString("utf8")) as TokenPayload;

  if (
    typeof payload.id !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string" ||
    (payload.step !== "otp_pending" && payload.step !== "authenticated") ||
    typeof payload.exp !== "number"
  ) {
    throw new Error("Token invalido");
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expirado");
  }

  return payload;
}

// Token temporal: se usa después del login con Google y antes de verificar el OTP
export function signPendingToken(user: BaseUserPayload): string {
  return createToken(user, "otp_pending", PENDING_TOKEN_TTL_SECONDS);
}

// Token final de acceso que se entregará recién cuando Google mas OTP ya fueron validados
export function signAccessToken(user: AccessTokenPayload): string {
  return createToken(user, "authenticated", ACCESS_TOKEN_TTL_SECONDS);
}

// Verifica y descifra cualquier token de sesión emitido por la app
export function verifyToken(token: string): TokenPayload {
  return decryptToken(token);
}
