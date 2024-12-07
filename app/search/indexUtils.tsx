export interface IFormInput {
  address?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  message: string;
  dataSource?: string;
}

export async function createEmbedding(text: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./embeddingGteWorker.tsx", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (event: MessageEvent) => {
      if (event.data.status === "complete") {
        console.log("finished creating embedding", event.data.output.length);
        resolve(event.data.output);
      }
    };
    worker.onerror = (error: ErrorEvent) => {
      console.error(error.message);
      reject(error);
    };
    worker.postMessage({ text });
  });
}

export async function createGTEEmbedding(text: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./embeddingGteWorker.tsx", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (event: MessageEvent) => {
      if (event.data.status === "complete") {
        console.log("finished creating embedding", event.data.output.length);
        resolve(event.data.output);
      }
    };
    worker.onerror = (error: ErrorEvent) => {
      console.error(error.message);
      reject(error);
    };
    worker.postMessage({ text });
  });
}
