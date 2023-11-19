import { ChatMessage } from "./ChatInput";

const ChatBox = ({ chatHistory }: { chatHistory: ChatMessage[] }) => {
  return (
    <div className="px-4 py-1 overflow-auto h-[calc(100vh-17.5rem)]">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`py-2 flex flex-row w-full ${
            message.isChatOwner ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-2 w-fit py-3 flex flex-col bg-purple-500 rounded-lg text-white ${
              message.isChatOwner ? "order-1 mr-2" : "order-2 ml-2"
            }`}
          >
            <span className="text-md">{message.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatBox;
