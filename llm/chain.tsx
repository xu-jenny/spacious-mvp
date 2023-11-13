import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DynamicStructuredTool, formatToOpenAITool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { AgentExecutor } from "langchain/agents";
import { formatToOpenAIToolMessages } from "langchain/agents/format_scratchpad/openai_tools";
import {
  OpenAIToolsAgentOutputParser,
  type ToolsAgentStep,
} from "langchain/agents/openai/output_parser";
import { locationExtactor, tagRecommender } from "./tools";
import { AIMessage, AgentAction, AgentFinish } from "langchain/schema";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-1106",
  temperature: 0.4,
});

const tools = [locationExtactor, tagRecommender];
const modelWithTools = model.bind({ tools: tools.map(formatToOpenAITool) });

const systemPrompt = `You are an assistant whose objective is to find a primary dataset tag that will answer the user's question. 
You should also suggest tangential dataset tags that supplements the primary tag, such that these dataset tags can help solve the user's question.
You should use the tag_recommender tool to find the tags, do not generate the tags yourself. 
All questions should be location-specific. If they are not, ask the user to specifiy a location. Use the location_extractor tool to extract the location.
The final answer should contain the primary tag, tangential tags and the location where the question is interested in.`

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
//   new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

/*
const responseSchema = z.object({
    primaryTag: z.string().describe("the primary tag centrally associated with the user's question, should be the answer from the Tag Recommender Tool"),
    tangentialTags: z.string().describe("the tangential tags that supplements the primary tag, should be the answer from the Tag Recommender Tool"),
    locations: z
      .string(z.string())
      .describe(
        "locations that the user's question is interested in, if it is not obvious then you should use the answer from Location Extractor Tool"
      ),
  });

  const responseOpenAIFunction = {
    name: "response",
    description: "Return the response to the user",
    parameters: zodToJsonSchema(responseSchema),
  };

  const structuredOutputParser = (
    output: AIMessage
  ): AgentAction | AgentFinish => {
    // If no function call is passed, return the output as an instance of `AgentFinish`
    if (!("function_call" in output.additional_kwargs)) {
      return { returnValues: { output: output.content }, log: output.content };
    }
    // Extract the function call name and arguments
    const functionCall = output.additional_kwargs.function_call;
    const name = functionCall?.name as string;
    const inputs = functionCall?.arguments as string;
    // Parse the arguments as JSON
    const jsonInput = JSON.parse(inputs);
    // If the function call name is `response` then we know it's used our final
    // response function and can return an instance of `AgentFinish`
    if (name === "response") {
      return { returnValues: { ...jsonInput }, log: output.content };
    }
    // If none of the above are true, the agent is not yet finished and we return
    // an instance of `AgentAction`
    return {
      tool: name,
      toolInput: jsonInput,
      log: output.content,
    };
  };
*/

const runnableAgent = RunnableSequence.from([
  {
    input: (i: { input: string; steps: ToolsAgentStep[] }) => i.input,
    agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[] }) =>
      formatToOpenAIToolMessages(i.steps),
  },
  prompt,
  modelWithTools,
  new OpenAIToolsAgentOutputParser(),
]).withConfig({ runName: "OpenAIToolsAgent" });

export const executor = AgentExecutor.fromAgentAndTools({
  agent: runnableAgent,
  tools,
});


