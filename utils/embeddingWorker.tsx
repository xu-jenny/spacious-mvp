import { Pipeline, pipeline } from "@xenova/transformers";

class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = "WhereIsAi/UAE-Large-V1";
  static instance: Promise<Pipeline> | null = null;

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
    let embed = await classifier(event.data.text, {
      pooling: "mean",
      normalize: true,
    });

    self.postMessage({
      status: "complete",
      output: embed,
    });
  }
  return null;
});
