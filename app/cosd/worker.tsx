import { Pipeline, PipelineType, pipeline } from "@xenova/transformers";
var similarity = require("compute-cosine-similarity");

class EmbeddingPipeline {
  static task: PipelineType = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
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
    let text1 = await classifier(event.data.text, {
      pooling: "mean",
      normalize: true,
    });

    let output = await classifier(event.data.text2, {
      pooling: "mean",
      normalize: true,
    });
    let sim = similarity(Array.from(output.data), Array.from(text1.data));
    console.log(sim);

    // Send the output back to the main thread
    self.postMessage({
      status: "complete",
      output: sim,
    });
  }
});
