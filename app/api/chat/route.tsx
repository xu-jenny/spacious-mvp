import { executor, memory } from "@/llm/chain";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();
  console.log("hit chat POST endpoint", query);
  const res = await executor.invoke({
    input: query,
  });
  console.log(res);

  await memory.saveContext({ input: query }, { output: res.output });
  console.log(memory);
  return NextResponse.json({ res, status: 200 });
}
