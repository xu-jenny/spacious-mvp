import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import "https://deno.land/x/xhr@0.2.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";
import { supabaseClient } from "./lib/supabase";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export async function semanticSearchTags(query: string) {
  // create embedding
  const queryEmbed: number[] = [];

  const { data: tags } = await supabaseClient.rpc("match_tags", {
    query_embedding: queryEmbed,
    match_threshold: 0.7,
    match_count: 10,
  });

  return tags;
}
