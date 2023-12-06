type Props = {
  placeholder?: string;
  handleEnter?: () => void;
  type?: string;
};

const Input = ({ placeholder, handleEnter, type = "text" }: Props) => {
  return (
    <>
      <input
        type={type}
        className="text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder={placeholder}
      />
    </>
  );
};

export default Input;
