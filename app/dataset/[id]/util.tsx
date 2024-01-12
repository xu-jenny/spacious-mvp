import { supabaseClient } from "@/clients/supabase";

export type Dataset = {
    id: number;
    title: string;
    summary: string;
    lastUpdated: string;
    firstPublished: string;
    location: string;
    locationType: string;
    datasetUrl: string;
    publisher: string;
    topic: string;
    subtags: string;
    license: string;
  };
export async function getDataset(id: number): Promise<Dataset | null> {
  const { data, error } = await supabaseClient
    .from("master_us")
    .select(
      "id, title, summary, lastUpdated, firstPublished, location, locationType, datasetUrl, publisher, topic, subtags, license"
    )
    .eq("id", id);
  if (error != null) {
    console.error("error fetching dataset id", id, error);
    return null;
  }
  if (data == null) {
    return null;
  }
  return data[0];
}

async function fetchCSV(url) {
  const response = await fetch(url);
  console.log(response);
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  return await response.text();
}
async function loadCSVtoPyodide(pyodide, csvData) {
  pyodide.globals.set('csvData', csvData);
  await pyodide.runPythonAsync(`

    import io

    df = pd.read_csv(io.StringIO(csvData))
  `);
}

// useEffect(() => {
//   if (typeof window !== "undefined") {
//     // Ensure this runs in browser only
//     const script = document.createElement("script");
//     script.src = "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js";
//     document.body.appendChild(script);

//     script.onload = async () => {
//       // Once the script is loaded, initialize Pyodide
//       try {
//         // window.loadPyodide is available after the script is loaded
//         const pyodide = await window.loadPyodide({
//           indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/'
//         });
//         // Handle the loaded Pyodide instance here
//         await pyodide.loadPackage('pandas');
//         // const csvData = await fetchCSV("https://data.cdc.gov/api/views/iwxc-qftf/rows.csv?accessType=DOWNLOAD")
//         const csvData = await fetchCSV("/bigsample.csv")
//         console.log(csvData)
//         loadCSVtoPyodide(pyodide, csvData)
//         setPyodide(pyodide);
//         console.log("initialized pyodide");
//       } catch (error) {
//         console.error('Error loading Pyodide:', error);
//       }
//     };

//     // Cleanup function to remove the script when the component unmounts
//     return () => {
//       document.body.removeChild(script);
//     };
//   }
// }, []);
//   `Generate python code that does {input}. Do not generate anything else.`
    // );

    // const model = new ChatOpenAI({});

    // const interpreter = await PythonInterpreterTool.initialize({
    //   indexURL: "../node_modules/pyodide",
    // });
    // const chain = prompt
    //   .pipe(model)
    //   .pipe(new StringOutputParser())
    //   .pipe(interpreter);

    // const result = await chain.invoke({
    //   input: `prints "Hello LangChain"`,
    // });
    // console.log(JSON.parse(result).stdout);

    //     const worker = new Worker(new URL("./worker.tsx", import.meta.url), {
    //       type: "module",
    //     });

    //     // Listen for messages from the worker
    //     worker.onmessage = (e) => {
    //       console.log(e);
    //     };

    //     // Example Python code
    //     const pythonCode = `
    // import micropip
    // await micropip.install('https://files.pythonhosted.org/packages/46/d2/0b1e4e8ad7097dc12543571333d65580e918dd19e26109dc4b8ec13b744c/multidict-6.0.4-cp39-cp39-musllinux_1_1_x86_64.whl')
    // await micropip.install('https://files.pythonhosted.org/packages/4e/13/e929a6a50288e60ade3961b294d2f5aeb251b6579e4290a5397e484d0df9/aiohttp-3.9.1-cp312-cp312-win_amd64.whl')
    // await micropip.install('https://files.pythonhosted.org/packages/3b/a7/1a4457f620d025767335e7d8ee4b7bf78b234fb677a6a7c353436e67fb23/pydantic_core-2.15.0-pp39-pypy39_pp73-musllinux_1_1_x86_64.whl')
    // await micropip.install('https://files.pythonhosted.org/packages/23/98/c70fac0f1b3193ced86013b563119c27c68ac26b684815f407555224108d/langchain-0.1.0-py3-none-any.whl')
    // print("hello world!");
    // from langchain.agents import AgentType
    // print(AgentType.OPENAI_FUNCTIONS)
    // `;

    //     worker.postMessage(pythonCode);
    // let options = {
    //   mode: "text",
    //   pythonOptions: ["-u"], // get print results in real-time
    //   args: [
    //     `${dataset?.title}.csv`,
    //     `${datasetUrls['CSV']}`,
    //     `${msg.text}`,
    //     process.env.NEXT_PUBLIC_OPENAI_API_KEY
    //   ], // arguments to your script
    // };
    // @ts-ignore
    // let pyshell = new PythonShell("app/api/test/test.py", options);
    // pyshell.on("message", function (message) {
    //   // received a message sent from the Python script (a simple "print" statement)
    //   console.log(message);
    // });
    // pyshell.end(function (err, code, signal) {
    //   if (err) throw err;
    //   console.log("The exit code was: " + code);
    //   console.log("The exit signal was: " + signal);
    //   console.log("finished");
    // });
    // let response = await post(
    //   process.env.NODE_ENV == "development"
    //     ? "http://127.0.0.1:5000/chat_csv"
    //     : process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "/chat_csv",
    //   {
    //     url: "https://www.fdic.gov/bank/individual/failed/banklist.csv",
    //     query: msg.text,
    //     insights: `Info about this dataset:
    //     The columns in the dataset are:\n1. Bank Name: Name of the bank\n2. City: City where the bank is located\n3. State: State where the bank is located\n4. Cert: Certification number\n5. Acquiring Institution: Name of the acquiring institution\n6. Closing Date: Date when the bank was closed\n7. Fund: Fund number.
    //     The "Closing Date" column contains date values, indicating that it is a timeseries. The timeseries spans from October 13, 2000, to November 3, 2023.
    //     Now answer the user's question. Do not use any previous knowlegde.`,
    //   }
    // );
    // console.log("response from flask server: ", response);