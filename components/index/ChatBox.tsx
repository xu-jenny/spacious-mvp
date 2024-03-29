import Spinner from "../common/Spinner";
import { ChatMessage } from "./ChatInput";

// TODO: Auto scroll to bottom on new messages
const ChatBox = ({
  chatHistory,
  loading,
}: {
  chatHistory: ChatMessage[];
  loading: Boolean;
}) => {
  return (
    <div className="flex-grow px-4 overflow-auto">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`py-2 flex flex-row w-full ${
            message.isChatOwner ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-2 w-fit py-3 flex flex-col rounded-lg max-w-2/3 ${
              message.isChatOwner
                ? "order-1 mr-2 bg-blue-500 text-white"
                : "order-2 ml-2 bg-slate-100 text-black"
            }`}
          >
            <span className="text-md">{message.text}</span>
            {message.attachment != null && message.attachment}
          </div>
        </div>
      ))}
      {loading ? (
        <div className="mx-5 p-2">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
};

export default ChatBox;
