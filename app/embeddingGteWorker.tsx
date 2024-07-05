import {
  FeatureExtractionPipeline,
  PipelineType,
  pipeline,
} from "@xenova/transformers";

class EmbeddingPipeline {
  static task: PipelineType = "feature-extraction";
  static model = "Alibaba-NLP/gte-base-en-v1.5";
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // @ts-ignore
      this.instance = pipeline(this.task, this.model);
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  // @ts-ignore
  let classifier = await EmbeddingPipeline.getInstance((x: Pipeline) => {
    self.postMessage(x);
  });

  if (classifier != null) {
    let text = await classifier(event.data.text, {
      pooling: "mean",
      normalize: true,
    });
    console.log(text);
    self.postMessage({
      status: "complete",
      output: text.data,
    });
  }
});
