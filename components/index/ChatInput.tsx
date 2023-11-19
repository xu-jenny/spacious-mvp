import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
interface ChatInputProps {
  sendANewMessage?: (message: any) => void;
  register?: UseFormRegister<{ message: string}>;
}

export type ChatMessage = {
  sentAt: Date;
  isChatOwner: boolean;
  text: string;
};

const ChatInput = ({ sendANewMessage, register }: ChatInputProps) => {
  const [newMessage, setNewMessage] = React.useState("");

  const doSendMessage = () => {
    if (newMessage && newMessage.length > 0) {
      const newMessagePayload = {
        sentAt: new Date(),
        isChatOwner: true,
        text: newMessage,
      };
      sendANewMessage != null && sendANewMessage(newMessagePayload);
      setNewMessage("");
    }
  };

  return (
    <div className="px-6 py-3 bg-white w-100 overflow-hidden rounded-bl-xl rounded-br-xla">
      <div className="flex flex-row items-center space-x-5">
        <input
          type="text"
          name="userMessageInput"
          className="text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Type a message"
          onChange={(e) => setNewMessage(e.target.value)}
          {...(register && register("message"))}
          required
        />
        <button
          type="submit"
          // disabled={!newMessage || newMessage.length === 0}
          className="px-3 py-2 text-xs font-medium text-center text-white bg-purple-500 rounded-lg hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 disabled:opacity-50"
          onClick={() => doSendMessage()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
