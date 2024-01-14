import { Dispatch, SetStateAction } from "react";

type Props = {
  name: string;
  options: string[];
  onSelect: Dispatch<SetStateAction<string>>;
};

const Dropdown = ({ name, options, onSelect }: Props) => {
  return (
    <div>
      <button
        id="dropdownHoverButton"
        data-dropdown-toggle="dropdownHover"
        data-dropdown-trigger="hover"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {name}
      </button>
      <div
        id="dropdownHover"
        className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownHoverButton"
        >
          {options.map((option) => (
            <li key={option} onClick={() => onSelect(option)}>
              <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                option
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Dropdown;
