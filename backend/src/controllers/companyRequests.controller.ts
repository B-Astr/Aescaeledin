// backend/src/controllers/companyRequests.controller.ts
import type { Request, Response } from "express";
import { User } from "../models/User";
import { CompanyRequest } from "../models/CompanyRequest";

export async function getPublicCompanies(_req: Request, res: Response) {
  try {
    const companies = await User.findAll({
      where: {
        role: "EMPRESA",
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      companies: companies.map((company) => ({
        id: company.id,
        email: company.email,
        role: company.role,
        name: company.name ?? null,
        picture: company.picture ?? null,
        headline: company.headline ?? null,
        bio: company.bio ?? null,
        phone: company.phone ?? null,
        location: company.location ?? null,
        website: company.website ?? null,
        linkedinUrl: company.linkedinUrl ?? null,
      })),
    });
  } catch (error) {
    console.error("getPublicCompanies error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function requestEmploymentAtCompany(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const professionalUserId = req.user.id;
    const userRole = req.user.role;
    const companyId = Number(req.params.id);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    if (userRole !== "PRO") {
      return res.status(403).json({
        error: "Solo los profesionales pueden solicitar empleo",
      });
    }

    const company = await User.findOne({
      where: {
        id: companyId,
        role: "EMPRESA",
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa no encontrada",
      });
    }

    if (company.id === professionalUserId) {
      return res.status(400).json({
        error: "No puedes solicitar empleo a tu propia cuenta",
      });
    }

    const existing = await CompanyRequest.findOne({
      where: {
        companyUserId: companyId,
        professionalUserId,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Ya solicitaste empleo en esta empresa",
      });
    }

    await CompanyRequest.create({
      companyUserId: companyId,
      professionalUserId,
    });

    return res.status(201).json({
      message: "Solicitud enviada correctamente",
    });
  } catch (error) {
    console.error("requestEmploymentAtCompany error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function getRequestsForCompany(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const companyUserId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "EMPRESA") {
      return res.status(403).json({
        error: "Solo las empresas pueden ver solicitudes",
      });
    }

    const requests = await CompanyRequest.findAll({
      where: {
        companyUserId,
      },
      order: [["createdAt", "DESC"]],
    });

    const professionalIds = requests.map((r) => r.professionalUserId);

    const professionals =
      professionalIds.length > 0
        ? await User.findAll({
            where: {
              id: professionalIds,
            },
          })
        : [];

    const usersById = new Map(
      professionals.map((user) => [
        user.id,
        {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          picture: user.picture ?? null,
          role: user.role,
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
        },
      ])
    );

    return res.json({
      requests: requests.map((request) => ({
        id: request.id,
        companyUserId: request.companyUserId,
        professionalUserId: request.professionalUserId,
        createdAt: request.createdAt,
        professional: usersById.get(request.professionalUserId) ?? null,
      })),
    });
  } catch (error) {
    console.error("getRequestsForCompany error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}