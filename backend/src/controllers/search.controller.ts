import type { Request, Response } from "express";
import { JobPost } from "../models/JobPost";
import { ProfessionalService } from "../models/ProfessionalService";
import { User } from "../models/User";
import {
  cosineSimilarity,
  getDocumentEmbedding,
  getEmbedding,
  LocalEmbeddingModelError,
} from "../lib/localEmbeddings";

type SearchResultType = "JOB" | "SERVICE";

type SearchDocument = {
  id: string;
  title: string;
  type: SearchResultType;
  description: string;
  route: string;
  searchText: string;
  embeddingCacheKey: string;
};

const MAX_QUERY_LENGTH = 160;
const MAX_RESULTS = 5;

function getUpdatedAtCacheValue(updatedAt: Date | undefined): string {
  return updatedAt instanceof Date ? updatedAt.toISOString() : "unknown";
}

async function loadSearchDocuments(): Promise<SearchDocument[]> {
  const [jobs, services] = await Promise.all([
    JobPost.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    }),
    ProfessionalService.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    }),
  ]);

  const professionalIds = services.map((service) => service.professionalUserId);
  const visibleProfessionals =
    professionalIds.length > 0
      ? await User.findAll({
          where: {
            id: professionalIds,
            publicProfileVisible: true,
          },
        })
      : [];
  const visibleProfessionalIds = new Set(
    visibleProfessionals.map((professional) => professional.id)
  );

  const jobDocuments: SearchDocument[] = jobs.map((job) => ({
    id: `job-${job.id}`,
    title: job.title,
    type: "JOB",
    description: job.description,
    route: `/jobs/${job.id}`,
    searchText: [
      job.title,
      job.description,
      job.location,
      job.employmentType,
    ]
      .filter(Boolean)
      .join(" | "),
    embeddingCacheKey:
      `JOB:${job.id}:${getUpdatedAtCacheValue(job.updatedAt)}`,
  }));

  const serviceDocuments: SearchDocument[] = services
    .filter((service) => visibleProfessionalIds.has(service.professionalUserId))
    .map((service) => ({
      id: `service-${service.id}`,
      title: service.title,
      type: "SERVICE",
      description: service.description,
      route: `/professionals/${service.id}`,
      searchText: [
        service.title,
        service.description,
        service.category,
        service.location,
      ]
        .filter(Boolean)
        .join(" | "),
      embeddingCacheKey:
        `SERVICE:${service.id}:${getUpdatedAtCacheValue(service.updatedAt)}`,
    }));

  return [...jobDocuments, ...serviceDocuments];
}

export async function searchSemanticContent(req: Request, res: Response) {
  try {
    const rawQuery = req.query.q;

    if (typeof rawQuery !== "string") {
      return res.status(400).json({
        error: "La consulta q es requerida",
      });
    }

    const query = rawQuery.trim();

    if (query.length < 3) {
      return res.status(400).json({
        error: "La consulta debe tener al menos 3 caracteres",
      });
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({
        error: `La consulta no puede superar ${MAX_QUERY_LENGTH} caracteres`,
      });
    }

    const documents = await loadSearchDocuments();

    if (documents.length === 0) {
      return res.json({ results: [] });
    }

    const queryEmbedding = await getEmbedding(query);
    const results = [];

    for (const document of documents) {
      const documentEmbedding = await getDocumentEmbedding(
        document.embeddingCacheKey,
        document.searchText
      );

      results.push({
        id: document.id,
        title: document.title,
        type: document.type,
        description: document.description,
        route: document.route,
        score: Number(
          cosineSimilarity(queryEmbedding, documentEmbedding).toFixed(4)
        ),
      });
    }

    return res.json({
      results: results
        .sort((left, right) => right.score - left.score)
        .slice(0, MAX_RESULTS),
    });
  } catch (error) {
    if (error instanceof LocalEmbeddingModelError) {
      return res.status(503).json({
        error: "No se pudo cargar el modelo de búsqueda local",
      });
    }

    console.error(
      "searchSemanticContent error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
