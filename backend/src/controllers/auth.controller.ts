// backend/src/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { signPendingToken, signAccessToken } from "../lib/jwt";
import { User } from "../models/User";

// Cliente OAuth de Google
function getGoogleClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID no está definido");
  }

  return new OAuth2Client(clientId);
}

// Respuesta segura del usuario
function pickUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? null,
    picture: user.picture ?? null,
    googleSub: user.googleSub ?? null,
    otpEnabled: Boolean(user.otpEnabled),

    // perfil extendido
    headline: user.headline ?? null,
    bio: user.bio ?? null,
    phone: user.phone ?? null,
    location: user.location ?? null,
    website: user.website ?? null,
    linkedinUrl: user.linkedinUrl ?? null,
    githubUrl: user.githubUrl ?? null,
    experience: user.experience ?? null,
    education: user.education ?? null,
    skills: user.skills ?? null,
    resumeUrl: user.resumeUrl ?? null,
    publicProfileVisible: Boolean(user.publicProfileVisible),

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeSignupRole(input?: string): "CLIENTE" | "EMPRESA" | "PRO" {
  const value = String(input ?? "CLIENTE").trim().toUpperCase();

  if (value === "CLIENTE" || value === "EMPRESA" || value === "PRO") {
    return value;
  }

  return "CLIENTE";
}

function normalizeIntent(input?: string): "login" | "register" {
  const value = String(input ?? "login").trim().toLowerCase();

  if (value === "register") {
    return "register";
  }

  return "login";
}

/**
 * POST /api/auth/google
 * Body: {
 *   idToken: string,
 *   intent?: "login" | "register",
 *   role?: "CLIENTE" | "EMPRESA"
 * }
 */
export async function googleLogin(req: Request, res: Response) {
  try {
    const { idToken, role, intent } = req.body as {
      idToken?: string;
      role?: "CLIENTE" | "EMPRESA" | "PRO";
      intent?: string;
    };

    if (!idToken) {
      return res.status(400).json({
        error: "idToken es requerido",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        error: "GOOGLE_CLIENT_ID no configurado",
      });
    }

    const googleClient = getGoogleClient();

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        error: "Token de Google inválido",
      });
    }

    const googleSub = payload.sub;
    const email = payload.email;
    const name = payload.name ?? null;
    const picture = payload.picture ?? null;

    if (!googleSub || !email) {
      return res.status(401).json({
        error: "Payload de Google incompleto",
      });
    }

    const selectedRole = normalizeSignupRole(role);
    const selectedIntent = normalizeIntent(intent);

    let user =
      (await User.findOne({ where: { email } })) ??
      (await User.findOne({ where: { googleSub } }));

    if (selectedIntent === "register") {
      if (user) {
        return res.status(409).json({
          error: "Ya existe una cuenta registrada con este correo. Inicia sesión en su lugar.",
        });
      }

      user = await User.create({
        email,
        googleSub,
        name,
        picture,
        role: selectedRole,
        otpEnabled: false,
        otpSecret: null,
      });
    }

    if (selectedIntent === "login") {
      if (!user) {
        return res.status(404).json({
          error: "No existe una cuenta registrada con este correo. Crea una cuenta primero.",
        });
      }

      let changed = false;

      if (user.googleSub !== googleSub) {
        user.googleSub = googleSub;
        changed = true;
      }

      if (user.name !== name) {
        user.name = name;
        changed = true;
      }

      if (user.picture !== picture) {
        user.picture = picture;
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    if (!user) {
      return res.status(500).json({
        error: "No se pudo resolver el usuario autenticado",
      });
    }

    const pendingToken = signPendingToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    if (!user.otpEnabled || !user.otpSecret) {
      return res.json({
        step: "OTP_SETUP_REQUIRED",
        pendingToken,
        user: pickUser(user),
      });
    }

    return res.json({
      step: "OTP_REQUIRED",
      pendingToken,
      user: pickUser(user),
    });
  } catch (error) {
    console.error("googleLogin error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

// GET /api/auth/me
export async function me(req: Request, res: Response) {
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

    return res.json({
      user: pickUser(user),
    });
  } catch (error) {
    console.error("me error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

// PUT /api/auth/profile
export async function updateProfile(req: Request, res: Response) {
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

    const {
      name,
      headline,
      bio,
      phone,
      location,
      website,
      linkedinUrl,
      githubUrl,
      experience,
      education,
      skills,
      resumeUrl,
      publicProfileVisible,
    } = req.body as {
      name?: string;
      headline?: string;
      bio?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedinUrl?: string;
      githubUrl?: string;
      experience?: string;
      education?: string;
      skills?: string;
      resumeUrl?: string;
      publicProfileVisible?: boolean;
    };

    if (typeof name === "string") {
      user.name = name.trim() || null;
    }

    if (typeof headline === "string") {
      user.headline = headline.trim() || null;
    }

    if (typeof bio === "string") {
      user.bio = bio.trim() || null;
    }

    if (typeof phone === "string") {
      user.phone = phone.trim() || null;
    }

    if (typeof location === "string") {
      user.location = location.trim() || null;
    }

    if (typeof website === "string") {
      user.website = website.trim() || null;
    }

    if (typeof linkedinUrl === "string") {
      user.linkedinUrl = linkedinUrl.trim() || null;
    }

    if (typeof githubUrl === "string") {
      user.githubUrl = githubUrl.trim() || null;
    }

    if (typeof experience === "string") {
      user.experience = experience.trim() || null;
    }

    if (typeof education === "string") {
      user.education = education.trim() || null;
    }

    if (typeof skills === "string") {
      user.skills = skills.trim() || null;
    }

    if (typeof resumeUrl === "string") {
      user.resumeUrl = resumeUrl.trim() || null;
    }

    if (user.role === "PRO" && typeof publicProfileVisible === "boolean") {
      user.publicProfileVisible = publicProfileVisible;
    }

    await user.save();

    return res.json({
      message: "Perfil actualizado correctamente",
      user: pickUser(user),
    });
  } catch (error) {
    console.error("updateProfile error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

/**
 * POST /api/auth/complete-login
 * Endpoint opcional de respaldo
 */
export async function completeLogin(req: Request, res: Response) {
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

    const token = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? null,
      picture: user.picture ?? null,
    });

    return res.json({
      token,
      user: pickUser(user),
    });
  } catch (error) {
    console.error("completeLogin error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
