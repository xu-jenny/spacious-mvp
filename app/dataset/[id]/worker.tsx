// public/pyodideWorker.js

self.addEventListener('message', async (event) => {
  // Import Pyodide
  self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js');

  try {
    // Initialize Pyodide
    let pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/'
    });

    await pyodide.loadPackage("micropip");
    // const micropip = pyodide.pyimport("micropip");
    // await micropip.install('snowballstemmer');
    // await micropip.install('langchain_experimental');

    // Run the Python code
    let result = await pyodide.runPythonAsync(event.data);

    // Post the result back to the main thread
    self.postMessage(result);
  } catch (error) {
    // Send error information back to the main thread
    self.postMessage({ error: error.message });
  }
});
