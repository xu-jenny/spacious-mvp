import { supabaseClient } from "@/clients/supabase";
import { ChatMessage } from "@/components/index/ChatInput";

export type TableEventType = "LinkClick" | "NextPage" | "PrevPage";
export async function logTableInteraction(
  eventType: TableEventType,
  position: number, // page number or row position
  itemId?: string
) {
  const { error } = await supabaseClient.from("events").insert({
    created_at: new Date(),
    event_type: eventType,
    position,
    item_id: itemId,
  });
  if (error) {
    console.error(error);
  }
}

export async function addQueries(
  chatHistory: ChatMessage[],
  locations: string | null,
  sessionId: number
) {
  const { data: rowData, error } = await supabaseClient
    .from("queries")
    .select()
    .eq("sessionId", sessionId)
    .single();

  if (error && error.code != "PGRST116") {
    console.error("Failed to fetch queries row.", error);
    return;
  }

  if (rowData == null) {
    await supabaseClient.from("queries").insert({
      query: JSON.stringify(chatHistory),
      locations: locations?.toString(),
      created_at: new Date(),
      sessionId: sessionId,
    });
    return;
  }

  await supabaseClient
    .from("queries")
    .update({ query: chatHistory, locations: locations?.toString() }) // TODO: locations can change, convert to an object w/ changed timestamp
    .eq("id", sessionId)
    .single();
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
  const { error } = await supabaseClient.from("data_requests").insert({
    query,
    ai_message: aiMessage,
    source,
    created_at: new Date(),
  });
  if (error) {
    console.error(error);
  }
}
