import { useState } from "react";
import DebouncedInput from "./DebouncedInput";

type Props = {
  placeHolder: string;
  onSubmit: (v: string) => Promise<void>;
  setQuery: (v: string) => void;
  initalVal?: string | null;
};

const SearchBar = ({ placeHolder, onSubmit, initalVal, setQuery }: Props) => {
  const [value, setValue] = useState<string>(initalVal ?? "");

  const onChange = (v: string) => {
    setValue(v);
    setQuery(v);
  }

  const onSearchSubmit = () => {
    onSubmit(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 20 20">
          <path
            stroke="currentColor"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <DebouncedInput
        type="search"
        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder={value ?? placeHolder}
        onkeydown={handleKeyDown}
        onChange={onChange}
        timeout={500}
      />
      <button
        type="submit"
        className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={onSearchSubmit}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;
