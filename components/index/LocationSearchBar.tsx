import React, { useEffect, useState } from "react";
import { USDatasetSource } from "@/components/index/SearchButton";
import { LocationType, useStateContext } from "@/app/StateContext";
import { useSearchParams } from "next/navigation";

type Props = {
  placeholder?: string;
  className?: string;
  // invokeLocUpdateDispatch:(val: string) => void;
  dsSource: USDatasetSource;
};

// const [value, setValue] = useState<string>(state.location.display_name);
// TODO: we need to lift dispatch coordinates to parent, so search bar can invoke it if it's submitted
// if (!loading && coordinates) {
//   dispatch({ type: "updateLocation", payload: coordinates });
// }

const isLatLong = (str: string) => {
  const latLongRegex =
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|(1[0-7]\d|\d{1,2})(\.\d+)?)$/;
  return latLongRegex.test(str);
};

export const LocationSearchBar = () => {
  const searchParams = useSearchParams();
  const urlLocation = searchParams.get('location') || searchParams.get('loc')
  const { state, dispatch } = useStateContext();
  const [locationList, setLocationList] = useState<LocationType[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(state.location?.name ?? urlLocation ?? "")
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  useEffect(() => {
    if (!isSelecting) {
      const timeoutId = setTimeout(() => {
        // console.log("debounced location val", inputValue);
        if (inputValue.length > 2) {
          fetchLocationSuggestions(inputValue);
        } else {
          setShowDropdown(false);
        }
      }, 700);

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, isSelecting]);

  const fetchLocationSuggestions = async (query: string) => {
    try {
      // if(!isLatLong(query)) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`);
        const data: LocationType[] = await response.json();
        console.log("fetched location suggestions", data)
        setLocationList(data.slice(0, Math.min(data.length, 5)));
        setShowDropdown(true);
      // }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const onInputChange = (value: string) => {
    setInputValue(value);
    setIsSelecting(false);
  };

  const onSelectLocation = (location: LocationType) => {
    dispatch({ type: 'updateLocation', payload: location });
    setInputValue(location.display_name);
    setShowDropdown(false);
    setIsSelecting(true);
    setLocationList([])
  };

  return (<>
    <input
      type={"text"}
      className={"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}
      value={inputValue}
      placeholder={"Enter a location"}
      onChange={(e) => onInputChange(e.target.value)}
    />
    {showDropdown && locationList.length > 0 && (
      <ul className="absolute p-1 m-0 bg-white z-10 border-solid border-1 border-gray-300">
        {locationList.map((location, index) => (
          <li
            key={index}
            onClick={() => onSelectLocation(location)}
            className="dropdown-item p-0 mt-0 list-none hover:bg-gray-300 cursor-pointer"
          >
            {location.display_name}
          </li>
        ))}
      </ul>
    )}

  </>)
}

// const LocationSearchBar: React.FC<Props> = ({
//   placeholder,
//   className,
//   dsSource,
// }: Props) => {
//   const renderSearchBar = useCallback(() => {
//     switch (dsSource) {
//       case "USGS_WATER":
//         if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== undefined) {
//           return (
//             <GoogleSearchBar
//               placeholder={placeholder}
//               className={className}
//             />
//           );
//         }
//       default:
//         return <DefaultLocationInput />;
//     }
//   }, [dsSource, placeholder, className]);

//   return <>{renderSearchBar()}</>;
// };

export default LocationSearchBar;
