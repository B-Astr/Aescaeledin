// backend/src/controllers/jobApplications.controller.ts
import type { Request, Response } from "express";
import { JobPost } from "../models/JobPost";
import { JobApplication } from "../models/JobApplication";
import { User } from "../models/User";

export async function applyToJob(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const applicantUserId = req.user.id;
    const applicantRole = req.user.role;
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    if (applicantRole !== "CLIENTE") {
      return res.status(403).json({
        error: "Solo los usuarios cliente pueden postular",
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

    if (job.companyUserId === applicantUserId) {
      return res.status(400).json({
        error: "No puedes postular a tu propia publicación",
      });
    }

    const existing = await JobApplication.findOne({
      where: {
        jobPostId: jobId,
        applicantUserId,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Ya postulaste a esta publicación",
      });
    }

    const rawMessage = req.body?.message;
    const message =
      typeof rawMessage === "string" && rawMessage.trim().length > 0
        ? rawMessage.trim().slice(0, 1000)
        : null;

    await JobApplication.create({
      jobPostId: jobId,
      applicantUserId,
      message,
    });

    return res.status(201).json({
      message: "Postulación enviada correctamente",
    });
  } catch (error) {
    console.error("applyToJob error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

export async function checkIfApplied(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const existing = await JobApplication.findOne({
      where: { jobPostId: jobId, applicantUserId: req.user.id },
    });

    return res.json({ applied: existing !== null });
  } catch (error) {
    console.error("checkIfApplied error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getJobApplicationById(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const applicationId = Number(req.params.id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const application = await JobApplication.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ error: "Postulación no encontrada" });
    }

    const job = await JobPost.findByPk(application.jobPostId);

    if (!job) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    const isApplicant = application.applicantUserId === req.user.id;
    const isCompanyOwner =
      req.user.role === "EMPRESA" && job.companyUserId === req.user.id;

    if (!isApplicant && !isCompanyOwner) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const [applicant, company] = await Promise.all([
      User.findByPk(application.applicantUserId),
      User.findByPk(job.companyUserId),
    ]);

    return res.json({
      application: {
        id: application.id,
        jobPostId: application.jobPostId,
        applicantUserId: application.applicantUserId,
        message: application.message ?? null,
        status: application.status ?? "PENDING",
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        job: {
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
          company: company
            ? {
                id: company.id,
                name: company.name ?? null,
                picture: company.picture ?? null,
                headline: company.headline ?? null,
                location: company.location ?? null,
                website: company.website ?? null,
              }
            : null,
        },
        applicant: applicant
          ? {
              id: applicant.id,
              email: applicant.email,
              name: applicant.name ?? null,
              picture: applicant.picture ?? null,
              role: applicant.role,
              headline: applicant.headline ?? null,
              bio: applicant.bio ?? null,
              phone: applicant.phone ?? null,
              location: applicant.location ?? null,
              website: applicant.website ?? null,
              linkedinUrl: applicant.linkedinUrl ?? null,
              githubUrl: applicant.githubUrl ?? null,
              experience: applicant.experience ?? null,
              education: applicant.education ?? null,
              skills: applicant.skills ?? null,
              resumeUrl: applicant.resumeUrl ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("getJobApplicationById error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getMyJobApplications(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const applications = await JobApplication.findAll({
      where: {
        applicantUserId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    const jobIds = applications.map((application) => application.jobPostId);
    const jobs =
      jobIds.length > 0
        ? await JobPost.findAll({
            where: {
              id: jobIds,
            },
          })
        : [];
    const jobsById = new Map(jobs.map((job) => [job.id, job]));

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
    const companiesById = new Map(companies.map((company) => [company.id, company]));

    return res.json({
      applications: applications.map((application) => {
        const job = jobsById.get(application.jobPostId) ?? null;
        const company = job ? companiesById.get(job.companyUserId) ?? null : null;

        return {
          id: application.id,
          jobPostId: application.jobPostId,
          applicantUserId: application.applicantUserId,
          message: application.message ?? null,
          status: application.status ?? "PENDING",
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
          job: job
            ? {
                id: job.id,
                title: job.title,
                description: job.description,
                location: job.location,
                latitude: job.latitude,
                longitude: job.longitude,
                placeId: job.placeId,
                employmentType: job.employmentType,
                isActive: Boolean(job.isActive),
                company: company
                  ? {
                      id: company.id,
                      name: company.name ?? null,
                      picture: company.picture ?? null,
                      headline: company.headline ?? null,
                      location: company.location ?? null,
                      website: company.website ?? null,
                    }
                  : null,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("getMyJobApplications error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getApplicationsForCompanyJob(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }

    const companyUserId = req.user.id;
    const companyRole = req.user.role;
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    if (companyRole !== "EMPRESA") {
      return res.status(403).json({
        error: "Solo las empresas pueden ver postulaciones",
      });
    }

    const job = await JobPost.findOne({
      where: {
        id: jobId,
        companyUserId,
      },
    });

    if (!job) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    const applications = await JobApplication.findAll({
      where: {
        jobPostId: jobId,
      },
      order: [["createdAt", "DESC"]],
    });

    const applicantIds = applications.map((a) => a.applicantUserId);

    const applicants =
      applicantIds.length > 0
        ? await User.findAll({
            where: {
              id: applicantIds,
            },
          })
        : [];

    const usersById = new Map(
      applicants.map((user) => [
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
      applications: applications.map((app) => ({
        id: app.id,
        jobPostId: app.jobPostId,
        applicantUserId: app.applicantUserId,
        message: app.message ?? null,
        status: app.status ?? "PENDING",
        createdAt: app.createdAt,
        applicant: usersById.get(app.applicantUserId) ?? null,
      })),
    });
  } catch (error) {
    console.error("getApplicationsForCompanyJob error:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

const VALID_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (req.user.role !== "EMPRESA") {
      return res.status(403).json({ error: "Solo las empresas pueden actualizar postulaciones" });
    }

    const jobId = Number(req.params.jobId);
    const appId = Number(req.params.appId);
    const { status } = req.body;

    if (!Number.isInteger(jobId) || jobId <= 0 || !Number.isInteger(appId) || appId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const job = await JobPost.findOne({ where: { id: jobId, companyUserId: req.user.id } });
    if (!job) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    const application = await JobApplication.findOne({ where: { id: appId, jobPostId: jobId } });
    if (!application) {
      return res.status(404).json({ error: "Postulación no encontrada" });
    }

    application.status = status;
    await application.save();

    return res.json({ id: application.id, status: application.status });
  } catch (error) {
    console.error("updateApplicationStatus error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
