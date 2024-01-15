import { Accordion } from "flowbite-react";

function cleanResponse(response: string[]): string {
  const startIndex =
    response.findIndex((str) => str.includes("AgentExecutor")) + 2;
  const consoleResponse = response
    .slice(startIndex, response.length - 2)
    .join("\n");

  const ansiEscapeCodeRegex = /\[[0-9;]*[mGK]/g;
  return consoleResponse.replace(ansiEscapeCodeRegex, "").trim();
}

const AiMessageDetail = ({ response }: { response: string[] }) => {
  return (
    <Accordion collapseAll className="mt-4">
      <Accordion.Panel>
        <Accordion.Title>See Agent details</Accordion.Title>
        <Accordion.Content>
          <pre className="text-gray-500 dark:text-gray-400 font-mono">
            {cleanResponse(response)}
          </pre>
        </Accordion.Content>
      </Accordion.Panel>
    </Accordion>
  );
};

export default AiMessageDetail;
