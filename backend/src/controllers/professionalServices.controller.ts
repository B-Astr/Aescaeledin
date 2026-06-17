// backend/src/controllers/professionalServices.controller.ts
import type { Request, Response } from "express";
import { ProfessionalService } from "../models/ProfessionalService";
import { User } from "../models/User";

function pickService(service: ProfessionalService) {
  return {
    id: service.id,
    professionalUserId: service.professionalUserId,
    title: service.title,
    description: service.description,
    category: service.category,
    location: service.location,
    latitude: service.latitude,
    longitude: service.longitude,
    placeId: service.placeId,
    price: service.price,
    isActive: Boolean(service.isActive),
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

function normalizeCoordinate(
  value: unknown,
  min: number,
  max: number
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  if (
    !Number.isFinite(numericValue) ||
    numericValue < min ||
    numericValue > max
  ) {
    return null;
  }

  return numericValue;
}

function normalizeServiceLocationPayload(body: {
  latitude?: unknown;
  longitude?: unknown;
  placeId?: unknown;
}) {
  const latitude = normalizeCoordinate(body.latitude, -90, 90);
  const longitude = normalizeCoordinate(body.longitude, -180, 180);

  if (latitude === null || longitude === null) {
    return {
      latitude: null,
      longitude: null,
      placeId: null,
    };
  }

  return {
    latitude,
    longitude,
    placeId:
      typeof body.placeId === "string" && body.placeId.trim()
        ? body.placeId.trim()
        : null,
  };
}

export async function createProfessionalService(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const {
      title,
      description,
      category,
      location,
      latitude,
      longitude,
      placeId,
      price,
    } = req.body as {
      title?: string;
      description?: string;
      category?: string;
      location?: string;
      latitude?: number | string | null;
      longitude?: number | string | null;
      placeId?: string | null;
      price?: string;
    };

    if (!title?.trim()) {
      return res.status(400).json({ error: "El título es requerido" });
    }

    if (!description?.trim()) {
      return res.status(400).json({ error: "La descripción es requerida" });
    }

    if (!category?.trim()) {
      return res.status(400).json({ error: "La categoría es requerida" });
    }

    const normalizedLocation = normalizeServiceLocationPayload({
      latitude,
      longitude,
      placeId,
    });

    const service = await ProfessionalService.create({
      professionalUserId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location?.trim() || null,
      latitude: normalizedLocation.latitude,
      longitude: normalizedLocation.longitude,
      placeId: normalizedLocation.placeId,
      price: price?.trim() || null,
      isActive: true,
    });

    return res.status(201).json({
      message: "Servicio creado correctamente",
      service: pickService(service),
    });
  } catch (error) {
    console.error("createProfessionalService error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getMyProfessionalServices(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const services = await ProfessionalService.findAll({
      where: { professionalUserId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      services: services.map(pickService),
    });
  } catch (error) {
    console.error("getMyProfessionalServices error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function updateMyProfessionalService(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const service = await ProfessionalService.findOne({
      where: {
        id: serviceId,
        professionalUserId: req.user.id,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    const {
      title,
      description,
      category,
      location,
      price,
      isActive,
    } = req.body as {
      title?: string;
      description?: string;
      category?: string;
      location?: string | null;
      price?: string | null;
      isActive?: boolean;
    };

    if (typeof title === "string" && title.trim()) {
      service.title = title.trim();
    }

    if (typeof description === "string" && description.trim()) {
      service.description = description.trim();
    }

    if (typeof category === "string" && category.trim()) {
      service.category = category.trim();
    }

    if (typeof location === "string") {
      service.location = location.trim() || null;
    }

    if (typeof price === "string") {
      service.price = price.trim() || null;
    }

    if (typeof isActive === "boolean") {
      service.isActive = isActive;
    }

    await service.save();

    return res.json({
      message: "Servicio actualizado correctamente",
      service: pickService(service),
    });
  } catch (error) {
    console.error("updateMyProfessionalService error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function deactivateMyProfessionalService(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const service = await ProfessionalService.findOne({
      where: {
        id: serviceId,
        professionalUserId: req.user.id,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    service.isActive = false;
    await service.save();

    return res.json({
      message: "Servicio desactivado correctamente",
      service: pickService(service),
    });
  } catch (error) {
    console.error("deactivateMyProfessionalService error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getPublicProfessionalServices(_req: Request, res: Response) {
  try {
    const services = await ProfessionalService.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });

    const professionalIds = services.map((s) => s.professionalUserId);

    const professionals =
      professionalIds.length > 0
        ? await User.findAll({
            where: {
              id: professionalIds,
              publicProfileVisible: true,
            },
          })
        : [];

    const usersById = new Map(
      professionals.map((user) => [
        user.id,
        {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          picture: user.picture ?? null,
          headline: user.headline ?? null,
          location: user.location ?? null,
        },
      ])
    );

    const visibleServices = services.filter((service) =>
      usersById.has(service.professionalUserId)
    );

    return res.json({
      services: visibleServices.map((service) => ({
        ...pickService(service),
        professional: usersById.get(service.professionalUserId) ?? null,
      })),
    });
  } catch (error) {
    console.error("getPublicProfessionalServices error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getPublicProfessionalServiceById(req: Request, res: Response) {
  try {
    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const service = await ProfessionalService.findOne({
      where: {
        id: serviceId,
        isActive: true,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    const professional = await User.findOne({
      where: {
        id: service.professionalUserId,
        publicProfileVisible: true,
      },
    });

    if (!professional) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    return res.json({
      service: {
        ...pickService(service),
        professional: {
          id: professional.id,
          name: professional.name ?? null,
          email: professional.email,
          picture: professional.picture ?? null,
          headline: professional.headline ?? null,
          bio: professional.bio ?? null,
          phone: professional.phone ?? null,
          location: professional.location ?? null,
          website: professional.website ?? null,
          linkedinUrl: professional.linkedinUrl ?? null,
          githubUrl: professional.githubUrl ?? null,
        },
      },
    });
  } catch (error) {
    console.error("getPublicProfessionalServiceById error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
