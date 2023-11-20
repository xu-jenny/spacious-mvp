import { ChatMessage } from "./ChatInput";

const ChatBox = ({
  chatHistory,
  isLoading = false,
}: {
  chatHistory: ChatMessage[];
  isLoading?: Boolean;
}) => {
  return (
    <div className="flex-grow px-4 py-1 overflow-auto ">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`py-2 flex flex-row w-full ${
            message.isChatOwner ? "justify-end" : "justify-start"
          }`}>
          <div
            className={`px-2 w-fit py-3 flex flex-col bg-purple-500 rounded-lg text-white ${
              message.isChatOwner ? "order-1 mr-2" : "order-2 ml-2"
            }`}>
            {isLoading == true ? (
              <p>Loading...</p>
            ) : (
              <span className="text-md">{message.text}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatBox;
