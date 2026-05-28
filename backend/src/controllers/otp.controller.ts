// backend/src/controllers/otp.controller.ts
import type { Request, Response } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { signAccessToken } from "../lib/jwt";
import { User } from "../models/User";

function pickUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? null,
    picture: user.picture ?? null,
    googleSub: user.googleSub ?? null,
    otpEnabled: Boolean(user.otpEnabled),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * POST /api/auth/otp/setup
 *
 * Requiere pendingToken o token válido.
 * Genera un secreto TOTP si el usuario aún no tiene uno
 * y devuelve QR en base64 + otpauth_url.
 */
export async function setupOtp(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Si ya tiene OTP activo y secreto, no lo regeneramos a menos que tú quieras permitir reset.
    if (user.otpEnabled && user.otpSecret) {
      const appName = process.env.OTP_APP_NAME || "ASCALEdin";
      const otpauthUrl = speakeasy.otpauthURL({
        secret: user.otpSecret,
        label: `${appName}:${user.email}`,
        issuer: appName,
        encoding: "base32",
      });

      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

      return res.json({
        message: "OTP ya estaba configurado",
        alreadyConfigured: true,
        otpEnabled: true,
        otpauthUrl,
        qrCodeDataUrl,
      });
    }

    const appName = process.env.OTP_APP_NAME || "ASCALEdin";

    const secret = speakeasy.generateSecret({
      name: `${appName}:${user.email}`,
      issuer: appName,
      length: 20,
    });

    if (!secret.base32 || !secret.otpauth_url) {
      return res.status(500).json({
        error: "No se pudo generar el secreto OTP",
      });
    }

    user.otpSecret = secret.base32;
    user.otpEnabled = false;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      message: "OTP configurado. Escanea el QR y luego verifica el código.",
      alreadyConfigured: false,
      otpEnabled: false,
      otpauthUrl: secret.otpauth_url,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error("setupOtp error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

/**
 * POST /api/auth/otp/verify
 * Body: { code: string }
 *
 * Requiere pendingToken o token válido.
 * Verifica el TOTP de 6 dígitos y entrega el JWT final.
 */
export async function verifyOtp(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const { code } = req.body as { code?: string };

    if (!code) {
      return res.status(400).json({
        error: "Código OTP requerido",
      });
    }

    const normalizedCode = String(code).trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return res.status(400).json({
        error: "El código OTP debe tener 6 dígitos",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    if (!user.otpSecret) {
      return res.status(400).json({
        error: "El usuario no tiene OTP configurado",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: "base32",
      token: normalizedCode,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({
        error: "Código OTP inválido o expirado",
      });
    }

    // Una vez validado correctamente, marcamos OTP activo
    if (!user.otpEnabled) {
      user.otpEnabled = true;
      await user.save();
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? null,
      picture: user.picture ?? null,
    });

    return res.json({
      message: "OTP validado correctamente",
      token: accessToken,
      user: pickUser(user),
    });
  } catch (error) {
    console.error("verifyOtp error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
