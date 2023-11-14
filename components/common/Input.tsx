import { useState } from "react";

const Input = ({
  placeholder,
  handleEnter,
}: {
  placeholder?: string;
  handleEnter?: () => void;
}) => {
  let [message, setMessage] = useState("");

  const handleSubmit = async () => {
    console.log("submit", message);
  };
  return (
    <>
      <div className="relative">
        <input
          type="text"
          id="filled_error"
          aria-describedby="filled_error_help"
          className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 border-0 border-b-2 appearance-none dark:text-white dark:border-red-500 focus:outline-none focus:ring-0 border-red-600 focus:border-red-600 dark:focus-border-red-500 peer"
          placeholder=" "
        />
        {/* <label
        for="filled_error"
        class="absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 text-red-600 dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
      >
        Filled error
      </label> */}
      </div>
      {/* <p
        id="filled_error_help"
        className="mt-2 text-xs text-red-600 dark:text-red-400"
      >
        <span className="font-medium">Oh, snapp!</span> Some error message.
      </p> */}
    </>
  );
};

export default Input;
