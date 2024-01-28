import { sampleData } from "@/clients/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("hit sample Supabase GET endpoint");
  let data = await sampleData();
  return NextResponse.json({ data, status: 200 });
}