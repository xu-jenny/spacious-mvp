import { supabaseClient } from "@/clients/supabase";
import { DatasetMetadata } from "@/components/MetadataTable";
import { ChatMessage } from "@/components/index/ChatInput";

export type TableEventType = "LinkClick" | "Pageinate";
//  TODO: pass metatable row index here
export async function logTableInteraction(
  eventType: TableEventType,
  position: number, // page number or row position
  itemId?: string
) {
  const { error } = await supabaseClient.from("dataRequests").insert({
    created_at: new Date(),
    eventType,
    position,
    itemId,
  });
  if (error) {
    console.error(error);
  }
}

export async function addQueries(
  chatHistory: ChatMessage[],
  locations: string[] | null
) {
  const { error } = await supabaseClient.from("queries").insert({
    query: JSON.stringify(chatHistory),
    locations: locations?.toString(),
    created_at: new Date(),
  });
  if (error) {
    console.error("Failed to add queries.", chatHistory, locations, error);
  }
}

export async function logError(errorType: string, message?: string) {
  const { error } = await supabaseClient.from("errors").insert({
    error: errorType,
    message,
    created_at: new Date(),
  });
  if (error) {
    console.error(error);
  }
}


export async function addDataRequest(
  query: string,
  aiMessage: string,
  source?: string
) {
  const { error } = await supabaseClient.from("dataRequests").insert({
    query,
    aiMessage,
    source,
    created_at: new Date(),
  });
  if (error) {
    console.error(error);
  }
}
