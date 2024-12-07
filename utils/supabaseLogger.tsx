import { supabaseClient } from "@/clients/supabase";
import { useAuthStateContext } from "@/components/AuthStateContext";
import { useEffect } from "react";

export type EventType =
  | "LinkClick"
  | "NextPage"
  | "PrevPage"
  | "Search"
  | "OriginalUrlClick"
  | "DownloadUrlClick"
  | "CloseDatasetPanel"
  | "TableDownload"
  | "ImageDownload"
  | "ERROR";

// Logger class
class Logger {
  private userEmail: string | undefined;

  setUserEmail(userEmail: string | undefined) {
    this.userEmail = userEmail;
  }

  async log(eventType: EventType, id: string, metadata: string = "") {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const { error, data } = await supabaseClient
      .from("events")
      .insert({
        created_at: new Date(),
        userEmail: this.userEmail ?? "N/A",
        event_type: eventType,
        item_id: id,
        metadata,
      })
      .select();
    console.log(data);
    if (error) {
      console.error("Logger Error:", error);
    }
  }

  async error(id: string, metadata: string = "") {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const { error } = await supabaseClient.from("events").insert({
      created_at: new Date(),
      userEmail: this.userEmail ?? "N/A",
      event_type: "ERROR",
      item_id: id,
      metadata,
    });
    if (error) {
      console.error("Logger Error:", error);
    }
  }
}

// Singleton Logger instance
const loggerInstance = new Logger();

export const useLogger = () => {
  const { session } = useAuthStateContext();

  // Set session-level info dynamically (only once per session)
  useEffect(() => {
    if (session?.user.email) {
      loggerInstance.setUserEmail(session.user.email);
    }
  }, [session]);

  return loggerInstance;
};

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
