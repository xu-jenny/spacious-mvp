import React, { useCallback } from "react";

type Props = {
  placeholder?: string;
  type?: string;
  className?: string;
  onChange: (value: string) => void;
  value?: string;
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
  value,
  onChange,
  className,
  onkeydown,
  type = "text",
  timeout = 500,
}: Props) => {
  const handleChange = useCallback(
    debounce((nextValue: string) => {
      console.log("decounded location val", nextValue);
      onChange(nextValue);
    }, timeout),
    [onChange, timeout] // Adding dependencies to prevent unnecessary re-creations
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value);
  };

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
        onChange={handleInputChange}
      />
    </div>
  );
};

export default DebouncedInput;
