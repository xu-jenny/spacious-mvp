// import React, { useCallback, useState } from "react";

// type Props = {
//   placeholder?: string;
//   type?: string;
//   className?: string;
//   onChange: React.Dispatch<React.SetStateAction<string>>;
//   value?: string;
//   onkeydown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
//   timeout?: number;
// };

// const debounce = <F extends (...args: any[]) => any>(
//   func: F,
//   delay: number
// ): ((...args: Parameters<F>) => void) => {
//   let inDebounce: ReturnType<typeof setTimeout>;
//   return function (...args: Parameters<F>) {
//     clearTimeout(inDebounce);
//     inDebounce = setTimeout(() => func(...args), delay);
//   } as (...args: Parameters<F>) => void;
// };

// const PeliasAutocomplete = ({
//   placeholder,
//   onChange,
//   className,
//   onkeydown,
//   type = "text",
//   timeout = 300,
// }: Props) => {
//   const [inputValue, setInputValue] = useState("");
//   const [suggestions, setSuggestions] = useState<string[]>([]);

//   const fetchSuggestions = async (input: string) => {
//     if (input.length < 1) {
//       setSuggestions([]);
//       return;
//     }

//     const formattedValue = input.replace(/ /g, "+");
//     const url = `http://localhost:4000/v1/search?text=${formattedValue}`;

//     console.log("Fetching suggestions from URL:", url);

//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         console.error("Error fetching suggestions:", response.statusText);
//         return;
//       }
//       const data = await response.json();
//       if (data.features) {
//         const suggestionLabels = data.features.map(
//           (feature: any) => feature.properties.label
//         );
//         setSuggestions(suggestionLabels);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const nextValue = e.target.value;
//     setInputValue(nextValue);
//     debounceFetchSuggestions(nextValue);
//   };

//   const debounceFetchSuggestions = useCallback(
//     debounce((nextValue: string) => {
//       fetchSuggestions(nextValue);
//     }, timeout),
//     []
//   );

//   const handleSuggestionClick = (suggestion: string) => {
//     setInputValue(suggestion);
//     onChange(suggestion);
//     setSuggestions([]);
//   };

//   return (
//     <div className="relative">
//       <input
//         type={type}
//         className={
//           className == null
//             ? "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//             : className
//         }
//         value={inputValue}
//         placeholder={placeholder}
//         onKeyDown={onkeydown}
//         onChange={handleChange}
//       />
//       {suggestions.length > 0 && (
//         <ul className="absolute bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-60 overflow-auto z-10">
//           {suggestions.map((suggestion, index) => (
//             <li
//               key={index}
//               onMouseDown={() => handleSuggestionClick(suggestion)}
//               className="cursor-pointer p-2 hover:bg-gray-200"
//             >
//               {suggestion}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default PeliasAutocomplete;
