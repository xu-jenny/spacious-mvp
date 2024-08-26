import React, { useEffect, useState } from "react";
import { LocationType, useStateContext } from "@/app/StateContext";
import { useSearchParams } from "next/navigation";
import { cleanAddress } from "./addressUtil";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

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
        if (inputValue.length > 2 && !isLatLong(inputValue)) {
          fetchLocationSuggestions(inputValue);
        } else {
          setShowDropdown(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, isSelecting]);

  const fetchLocationSuggestions = async (query: string) => {
    try {
      if (!isLatLong(query)) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=us`);
        const data: LocationType[] = await response.json();
        console.log("fetched location suggestions", data)
        data.forEach((d) => {
          d.display_name = cleanAddress(d.display_name);
        });
        setLocationList(data.slice(0, Math.min(data.length, 5)));
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const onInputChange = (value: string) => {
    setInputValue(value);
    setIsSelecting(false);
    if (isLatLong(value)) {
      const [lat, lng] = value
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      dispatch({ type: 'updateLocation', payload: { lat, lon: lng, name: '', display_name: '', addresstype: 'coordinate' } });
    }
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
      className={"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}
      value={inputValue}
      placeholder={"Enter a location"}
      onChange={(e) => onInputChange(e.target.value)}
    />
    {showDropdown && locationList.length > 0 && (
      <ul className="absolute max-w-md p-1 m-0 bg-white z-10 border-solid border-1 border-gray-300">
        {locationList.map((location, index) => (
          <li
            key={index}
            onClick={() => onSelectLocation(location)}
            className="dropdown-item whitespace-normal m-0 p-1 list-none border-b border-gray-300 last:border-none hover:bg-gray-300 cursor-pointer text-sm"
          >
            {location.display_name}
          </li>
        ))}
      </ul>
    )}

  </>)
}


export const LaserficheLocationBar = () => {
  const { dispatch } = useStateContext();
  const options = ['NCS000050', 'NCG080886', 'NCG240012', 'WI0500447', 'NCG060230'];
  const [value, setValue] = React.useState<string | null>(options[0]);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div>
      <Autocomplete
        value={value}
        onChange={(event: any, newValue: string | null) => {
          setValue(newValue);
          if (newValue != null){
            dispatch({ type: 'updateLocation', payload: { lat: 0.0, lon: 0.0, name: newValue, display_name: newValue, addresstype: 'string' } });
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id="location-bar"
        options={options}
        renderInput={(params) => <TextField {...params} />}
      />
    </div>
  );
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
