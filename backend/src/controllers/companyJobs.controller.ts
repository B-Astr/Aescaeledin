// backend/src/controllers/companyJobs.controller.ts
import type { Request, Response } from "express";
import { JobPost } from "../models/JobPost";
import { User } from "../models/User";

function pickJob(job: JobPost) {
  return {
    id: job.id,
    companyUserId: job.companyUserId,
    title: job.title,
    description: job.description,
    location: job.location,
    latitude: job.latitude,
    longitude: job.longitude,
    placeId: job.placeId,
    employmentType: job.employmentType,
    isActive: Boolean(job.isActive),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function pickCompany(user: User | null) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? null,
    picture: user.picture ?? null,
    headline: user.headline ?? null,
    location: user.location ?? null,
    website: user.website ?? null,
  };
}

async function attachCompaniesToJobs(jobs: JobPost[]) {
  const companyIds = [...new Set(jobs.map((job) => job.companyUserId))];
  const companies =
    companyIds.length > 0
      ? await User.findAll({
          where: {
            id: companyIds,
            role: "EMPRESA",
          },
        })
      : [];
  const companiesById = new Map(
    companies.map((company) => [company.id, pickCompany(company)])
  );

  return jobs.map((job) => ({
    ...pickJob(job),
    company: companiesById.get(job.companyUserId) ?? null,
  }));
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

function normalizeJobLocationPayload(body: {
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

export async function createJobPost(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const {
      title,
      description,
      location,
      latitude,
      longitude,
      placeId,
      employmentType,
    } = req.body as {
      title?: string;
      description?: string;
      location?: string;
      latitude?: number | string | null;
      longitude?: number | string | null;
      placeId?: string | null;
      employmentType?: string;
    };

    if (!title?.trim()) {
      return res.status(400).json({
        error: "El título es requerido",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        error: "La descripción es requerida",
      });
    }

    const allowedTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
    const normalizedType = allowedTypes.includes(String(employmentType))
      ? String(employmentType)
      : "FULL_TIME";
    const normalizedLocation = normalizeJobLocationPayload({
      latitude,
      longitude,
      placeId,
    });

    const job = await JobPost.create({
      companyUserId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      location: location?.trim() || null,
      latitude: normalizedLocation.latitude,
      longitude: normalizedLocation.longitude,
      placeId: normalizedLocation.placeId,
      employmentType: normalizedType,
      isActive: true,
    });

    return res.status(201).json({
      message: "Publicación creada correctamente",
      job: pickJob(job),
    });
  } catch (error) {
    console.error("createJobPost error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function getMyJobPosts(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const jobs = await JobPost.findAll({
      where: {
        companyUserId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      jobs: jobs.map(pickJob),
    });
  } catch (error) {
    console.error("getMyJobPosts error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function updateMyJobPost(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const job = await JobPost.findOne({
      where: {
        id: jobId,
        companyUserId: req.user.id,
      },
    });

    if (!job) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    const {
      title,
      description,
      location,
      latitude,
      longitude,
      placeId,
      employmentType,
      isActive,
    } = req.body as {
      title?: string;
      description?: string;
      location?: string | null;
      latitude?: number | string | null;
      longitude?: number | string | null;
      placeId?: string | null;
      employmentType?: string;
      isActive?: boolean;
    };

    if (typeof title === "string" && title.trim()) {
      job.title = title.trim();
    }

    if (typeof description === "string" && description.trim()) {
      job.description = description.trim();
    }

    if (typeof location === "string") {
      job.location = location.trim() || null;
    }

    if (
      Object.hasOwn(req.body, "latitude") ||
      Object.hasOwn(req.body, "longitude") ||
      Object.hasOwn(req.body, "placeId")
    ) {
      const normalizedLocation = normalizeJobLocationPayload({
        latitude,
        longitude,
        placeId,
      });

      job.latitude = normalizedLocation.latitude;
      job.longitude = normalizedLocation.longitude;
      job.placeId = normalizedLocation.placeId;
    }

    const allowedTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
    if (typeof employmentType === "string" && allowedTypes.includes(employmentType)) {
      job.employmentType = employmentType;
    }

    if (typeof isActive === "boolean") {
      job.isActive = isActive;
    }

    await job.save();

    return res.json({
      message: "Publicación actualizada correctamente",
      job: pickJob(job),
    });
  } catch (error) {
    console.error("updateMyJobPost error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function deactivateMyJobPost(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const job = await JobPost.findOne({
      where: {
        id: jobId,
        companyUserId: req.user.id,
      },
    });

    if (!job) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    job.isActive = false;
    await job.save();

    return res.json({
      message: "Publicación desactivada correctamente",
      job: pickJob(job),
    });
  } catch (error) {
    console.error("deactivateMyJobPost error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function getPublicJobPosts(_req: Request, res: Response) {
  try {
    const jobs = await JobPost.findAll({
      where: {
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      jobs: await attachCompaniesToJobs(jobs),
    });
  } catch (error) {
    console.error("getPublicJobPosts error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}


export async function getPublicJobById(req: Request, res: Response) {
  try {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const job = await JobPost.findOne({
      where: {
        id: jobId,
        isActive: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    const company = await User.findOne({
      where: {
        id: job.companyUserId,
        role: "EMPRESA",
      },
    });

    return res.json({
      job: {
        ...pickJob(job),
        company: pickCompany(company),
      },
    });
  } catch (error) {
    console.error("getPublicJobById error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
