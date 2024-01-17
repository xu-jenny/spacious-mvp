export async function createEmbedding(
  text: string
): Promise<{ dims: any[]; type: string; data: number[]; size: number } | null> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./embeddingWorker.tsx", import.meta.url));
    worker.onmessage = (event) => {
      console.log(event.data);
      if (event.data.status == "complete") {
        console.log("finished creating embedding", event.data.output);
        resolve(event.data.output);
      }
    };
    worker.onerror = (error) => {
      reject(error);
    };
    worker.postMessage({ text });
  });
}

// const classifier = await EmbeddingPipeline.getInstance();
// const embedding = await classifier(text, {
//   pooling: "mean",
//   normalize: true,
// });
// return embedding;
