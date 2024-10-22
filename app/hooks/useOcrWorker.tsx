import { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';

export const useOCRWorker = () => {
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    const initWorker = async () => {
      const workerInstance = await createWorker('eng');
      setWorker(workerInstance);
    };

    initWorker();

    return () => {
      // Clean up the worker on unmount
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  return worker;
};