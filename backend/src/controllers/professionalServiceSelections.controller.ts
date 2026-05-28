// backend/src/controllers/professionalServiceSelections.controller.ts
import type { Request, Response } from "express";
import { ProfessionalService } from "../models/ProfessionalService";
import { ProfessionalServiceSelection } from "../models/ProfessionalServiceSelection";
import { User } from "../models/User";

export async function selectProfessionalService(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const clientUserId = req.user.id;
    const userRole = req.user.role;
    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    if (userRole !== "CLIENTE") {
      return res.status(403).json({
        error: "Solo los usuarios cliente pueden seleccionar servicios",
      });
    }

    const service = await ProfessionalService.findOne({
      where: {
        id: serviceId,
        isActive: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        error: "Servicio no encontrado",
      });
    }

    if (service.professionalUserId === clientUserId) {
      return res.status(400).json({
        error: "No puedes seleccionar tu propio servicio",
      });
    }

    const existing = await ProfessionalServiceSelection.findOne({
      where: {
        professionalServiceId: serviceId,
        clientUserId,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Ya seleccionaste este servicio",
      });
    }

    await ProfessionalServiceSelection.create({
      professionalServiceId: serviceId,
      clientUserId,
    });

    return res.status(201).json({
      message: "Servicio seleccionado correctamente",
    });
  } catch (error) {
    console.error("selectProfessionalService error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function getSelectionsForProfessionalService(
  req: Request,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const professionalUserId = req.user.id;
    const userRole = req.user.role;
    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    if (userRole !== "PRO") {
      return res.status(403).json({
        error: "Solo los profesionales pueden ver estas selecciones",
      });
    }

    const service = await ProfessionalService.findOne({
      where: {
        id: serviceId,
        professionalUserId,
      },
    });

    if (!service) {
      return res.status(404).json({
        error: "Servicio no encontrado",
      });
    }

    const selections = await ProfessionalServiceSelection.findAll({
      where: {
        professionalServiceId: serviceId,
      },
      order: [["createdAt", "DESC"]],
    });

    const clientIds = selections.map((s) => s.clientUserId);

    const clients =
      clientIds.length > 0
        ? await User.findAll({
            where: {
              id: clientIds,
            },
          })
        : [];

    const usersById = new Map(
      clients.map((user) => [
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
      selections: selections.map((selection) => ({
        id: selection.id,
        professionalServiceId: selection.professionalServiceId,
        clientUserId: selection.clientUserId,
        createdAt: selection.createdAt,
        client: usersById.get(selection.clientUserId) ?? null,
      })),
    });
  } catch (error) {
    console.error("getSelectionsForProfessionalService error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}