import { Pipeline, pipeline } from "@xenova/transformers";
var similarity = require("compute-cosine-similarity");

class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = "WhereIsAi/UAE-Large-V1";
  static instance: Promise<Pipeline> | null = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model);
    }

    return this.instance;
  }
}

export async function createEmbedding(
  text: string
): Promise<{ dims: any[]; type: string; data: number[]; size: number } | null> {
  const classifier = await EmbeddingPipeline.getInstance();
  const embedding = await classifier(text, {
    pooling: "mean",
    normalize: true,
  });
  return embedding;
}
