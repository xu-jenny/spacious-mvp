import {
  FeatureExtractionPipeline,
  PipelineType,
  Tensor,
  pipeline,
} from "@xenova/transformers";

class EmbeddingPipeline {
  static task: PipelineType = "feature-extraction";
  static model = "WhereIsAi/UAE-Large-V1";
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // @ts-ignore
      this.instance = pipeline(this.task, this.model);
    }

    return this.instance;
  }
}

export async function createEmbedding(
  text: string
): Promise<Tensor | null> {
  const classifier = await EmbeddingPipeline.getInstance();
  if (classifier != null) {
    const embedding = await classifier(text, {
      pooling: "mean",
      normalize: true,
    });
    return embedding;
  }
  return null;
}
