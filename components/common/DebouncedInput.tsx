import React, { useCallback, useState } from "react";

type Props = {
  // onChange: (value: string) => void; // called whenever input change, connect this to a state
  initalValue: string;
  onDebounceChange: (value: string) => void; // called when debounce is finished
  placeholder?: string;
  type?: string;
  className?: string;
  onkeydown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  timeout?: number;
};

const debounce = <F extends (...args: any[]) => any>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let inDebounce: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<F>) {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func(...args), delay);
  } as (...args: Parameters<F>) => void;
};

const DebouncedInput: React.FC<Props> = ({
  placeholder,
  initalValue,
  // onChange,
  onDebounceChange,
  className,
  onkeydown,
  type = "text",
  timeout = 500,
}: Props) => {
  const [value, setValue] = useState<string>(initalValue ?? "")
  // const handleChange = useCallback(
  //   debounce((nextValue: string) => {
  //     console.log("decounded location val", nextValue);
  //     onDebounceChange(nextValue);
  //   }, timeout),
  //   [onDebounceChange, timeout] // Adding dependencies to prevent unnecessary re-creations
  // );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("decounded location val", value);
      onDebounceChange(value);
    }, timeout);
    return () => clearTimeout(timeoutId);
  }, [value, timeout, onDebounceChange]);


  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   handleChange(e.target.value);
  //   onChange(e.target.value);
  // };

  return (
    <div>
      <input
        type={type}
        className={
          className == null
            ? "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            : className
        }
        value={value}
        placeholder={placeholder}
        onKeyDown={onkeydown}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default DebouncedInput;
