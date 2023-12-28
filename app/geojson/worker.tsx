import { Pipeline, pipeline } from '@xenova/transformers';

class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance : Promise<Pipeline> | null = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
    // @ts-ignore
    let classifier = await EmbeddingPipeline.getInstance((x: Pipeline) => {
        self.postMessage(x);
    });

    // Actually perform the classification
    let output = await classifier(event.data.text);
    console.log(output);
    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output.data,
    });
});
