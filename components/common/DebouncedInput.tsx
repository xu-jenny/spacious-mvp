import { useCallback } from "react";

type Props = {
  placeholder?: string;
  type?: string;
  className?: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  onkeydown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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

const DebouncedInput = ({
  placeholder,
  onChange,
  className,
  onkeydown,
  type = "text",
}: Props) => {
  const handleChange = useCallback(
    debounce((nextValue: string) => {
      onChange(nextValue);
    }, 500),
    []
  );

  return (
    <div>
      <input
        type={type}
        className={
          className == null
            ? "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            : className
        }
        placeholder={placeholder}
        onKeyDown={onkeydown}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default DebouncedInput;
