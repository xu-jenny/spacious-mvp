// pyodideManager.js

let pyodideLoaded = false;
let pyodide = null;

export const loadPyodide = async () => {
  if (!pyodideLoaded) {
    const pyodideModule = await import('https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js');
    pyodide = await pyodideModule.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
    });
    pyodideLoaded = true;
  }
  return pyodide;
};

export const runPythonCode = async (code) => {
  if (!pyodide) {
    await loadPyodide();
  }

  try {
    return await pyodide.runPythonAsync(code);
  } catch (error) {
    console.error('Error executing Python code:', error);
    throw error;
  }
};
