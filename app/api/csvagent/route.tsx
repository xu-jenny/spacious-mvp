import { NextResponse } from "next/server";
import { PythonShell } from "python-shell";

export async function POST(req: Request, res: Response){
  let { filename, fileUrl, query } = await req.json();
  console.log("hit csvagent POST endpoint", query, filename, fileUrl);
  let pythonMessages: string[] = [];

  let options = {
    mode: "text",
    pythonOptions: ["-u"], // get print results in real-time
    args: [filename, fileUrl, query, process.env.NEXT_PUBLIC_OPENAI_API_KEY],
  };

  try {
    const result = await new Promise((resolve, reject) => {
      //@ts-ignore
      let pyshell = new PythonShell("app/api/test/test.py", options);
      pyshell.on("message", function (message) {
        console.log(message);
        pythonMessages.push(message);
      });

      pyshell.end(function (err, code, signal) {
        if (err) throw err;
        console.log("The exit code was: " + code);
        console.log("The exit signal was: " + signal);
        console.log("finished python script");
        resolve(pythonMessages);
      });
    });
    return NextResponse.json({ data: result, status: 200 });
  } catch (error) {
    return NextResponse.json({ data: error, status: 400 });
  }
}
