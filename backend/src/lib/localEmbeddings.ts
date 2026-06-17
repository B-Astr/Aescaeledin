const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

type EmbeddingTensor = {
  tolist(): unknown;
};

type FeatureExtractor = (
  text: string,
  options: {
    pooling: "mean";
    normalize: true;
  }
) => Promise<EmbeddingTensor>;

const documentEmbeddingCache = new Map<string, number[]>();
let extractorPromise: Promise<FeatureExtractor> | null = null;

export class LocalEmbeddingModelError extends Error {
  constructor() {
    super("Local embedding model could not be loaded");
    this.name = "LocalEmbeddingModelError";
  }
}

export function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers")
      .then(async ({ pipeline }) => {
        const extractor = await pipeline(
          "feature-extraction",
          EMBEDDING_MODEL
        );

        return extractor as unknown as FeatureExtractor;
      })
      .catch((_error) => {
        extractorPromise = null;
        console.error("Local embedding model could not be loaded");
        throw new LocalEmbeddingModelError();
      });
  }

  return extractorPromise;
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getExtractor();
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    const rows = output.tolist();

    if (!Array.isArray(rows) || !Array.isArray(rows[0])) {
      throw new LocalEmbeddingModelError();
    }

    const embedding = rows[0];

    if (
      embedding.length === 0 ||
      !embedding.every(
        (value) => typeof value === "number" && Number.isFinite(value)
      )
    ) {
      throw new LocalEmbeddingModelError();
    }

    return embedding;
  } catch (error) {
    if (error instanceof LocalEmbeddingModelError) {
      throw error;
    }

    console.error("Local embedding could not be generated");
    throw new LocalEmbeddingModelError();
  }
}

export async function getDocumentEmbedding(
  cacheKey: string,
  searchText: string
): Promise<number[]> {
  const cached = documentEmbeddingCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const embedding = await getEmbedding(searchText);
  documentEmbeddingCache.set(cacheKey, embedding);

  return embedding;
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}
