import { LocationType, useStateContext } from "@/app/StateContext";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { cleanAddress } from "./addressUtil";
import LocationInfo from "./LocationInfo";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const isLatLong = (str: string) => {
  const latLongRegex =
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|(1[0-7]\d|\d{1,2})(\.\d+)?)$/;
  return latLongRegex.test(str);
};

export const LocationSearchBar = () => {
  const searchParams = useSearchParams();
  const urlLocation = searchParams.get("location") || searchParams.get("loc");
  const { state, dispatch } = useStateContext();
  const [locationList, setLocationList] = useState<LocationType[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(
    state.location?.name ?? urlLocation ?? ""
  );
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add isLoading state
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isControlledChange = useRef(false);

  useEffect(() => {
    if (!isControlledChange.current) {
      setInputValue(state.location?.name ?? "");
    }
    isControlledChange.current = false; // Reset flag after setting value
  }, [state.location]);

  useEffect(() => {
    if (!isSelecting) {
      const timeoutId = setTimeout(() => {
        if (inputValue.length > 2 && !isLatLong(inputValue)) {
          setIsLoading(true); // Set loading to true before fetching
          fetchLocationSuggestions(inputValue).finally(() =>
            setIsLoading(false)
          ); // Set loading to false after fetching
        } else {
          setShowDropdown(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, isSelecting]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const fetchLocationSuggestions = async (query: string) => {
    try {
      if (!isLatLong(query)) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=us&addressdetails=1`
        );
        const data: LocationType[] = await response.json();
        console.log("fetched location suggestions", data);
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
    isControlledChange.current = true;
    setInputValue(value);
    setIsSelecting(false);
    if (isLatLong(value)) {
      const [lat, lng] = value
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      dispatch({
        type: "updateLocation",
        payload: {
          lat,
          lon: lng,
          name: "",
          display_name: "",
          addresstype: "coordinate",
        },
      });
    }
    if (value.trim() == "") {
      dispatch({
        type: "updateLocation",
        payload: {
          lat: 0,
          lon: 0,
          display_name: "",
          name: "",
          addresstype: "city",
        },
      });
    }
  };

  const onSelectLocation = (location: LocationType) => {
    dispatch({ type: "updateLocation", payload: location });
    setInputValue(location.display_name);
    setShowDropdown(false);
    setIsSelecting(true);
    setLocationList([]);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <input
          type={"text"}
          className={
            "pr-7 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          }
          value={inputValue}
          placeholder={"Enter a location"}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <div className="absolute right-2 top-2">
          <LocationInfo
            locationName={state.location?.name || "Location Info"}
            locationDetails={
              state.location || {
                lat: 0,
                lon: 0,
                name: "",
                display_name: "",
                addresstype: "unknown",
                address: {
                  house_number: "",
                  road: "",
                  city: "",
                  county: "",
                  state: "",
                  postcode: "",
                  country: "",
                },
              }
            }
            isLoading={isLoading} // Pass isLoading state
          />
        </div>
        {showDropdown && locationList.length > 0 && (
          <ul className="absolute w-full p-1 m-0 bg-white z-10 border border-gray-400 rounded-lg shadow-lg">
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
      </div>
    </>
  );
};

export const LaserficheLocationBar = () => {
  const { dispatch } = useStateContext();
  const options = [
    "NCS000050",
    "NCG080886",
    "NCG240012",
    "WI0500447",
    "NCG060230",
  ];
  const [value, setValue] = React.useState<string | null>(options[0]);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <div>
      <Autocomplete
        value={value}
        onChange={(event: any, newValue: string | null) => {
          setValue(newValue);
          if (newValue != null) {
            dispatch({
              type: "updateLocation",
              payload: {
                lat: 0.0,
                lon: 0.0,
                name: newValue,
                display_name: newValue,
                addresstype: "string",
              },
            });
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
};
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
