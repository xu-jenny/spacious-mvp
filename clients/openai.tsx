// import OpenAI from "openai";

// export const openai = new OpenAI({
//   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true,
// });

// export const openaiChat = async (systemPrompt: string, message: string) => {
//   try {
//     const result = await openai.chat.completions.create({
//       model: "gpt-4",
//       temperature: 0.25,
//       max_tokens: 256,
//       top_p: 1,
//       frequency_penalty: 0.0,
//       presence_penalty: 0.0,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: message },
//       ],
//     });
//     return result["choices"][0]["message"]["content"];
//   } catch (e) {
//     console.error("Error invoking openaiComplete", e);
//   }
// };

// export const openaiEmbed = async (text: string) => {
//   try {
//     const result = await openai.embeddings.create({
//       model: "text-embedding-ada-002",
//       input: text,
//     });
//     return result["data"];
//   } catch (e) {
//     console.error("Error invoking openaiComplete", e);
//   }
// };
