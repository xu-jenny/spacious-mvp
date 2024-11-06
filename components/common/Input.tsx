import React from "react";

type Props = {
  placeholder?: string;
  type?: string;
  className?: string;
  onChange: (value: string) => void;
  value?: string;
  onkeydown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean; // Add disabled prop
};

const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      placeholder,
      value,
      onChange,
      className,
      onkeydown,
      type = "text",
      disabled = false,
    }, // Default disabled to false
    ref
  ) => {
    return (
      <div>
        <input
          ref={ref}
          type={type}
          className={
            className == null
              ? "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              : className
          }
          value={value}
          placeholder={placeholder}
          onKeyDown={onkeydown}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled} // Use the disabled prop
        />
      </div>
    );
  }
);

Input.displayName = "InputComponent";
export default Input;
