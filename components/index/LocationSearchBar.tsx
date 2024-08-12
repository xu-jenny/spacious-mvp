import React, { useEffect, useState } from "react";
import { USDatasetSource } from "@/components/index/SearchButton";
import { LocationType, useStateContext } from "@/app/StateContext";
import { useSearchParams } from "next/navigation";
import { cleanAddress } from "./addressUtil";

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
        /*const data = [
          {
              "place_id": 15432503,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 743825610,
              "lat": "40.7484265",
              "lon": "-73.8763771",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Queens County, NY",
              "boundingbox": [
                  "40.7484160",
                  "40.7484390",
                  "-73.8764800",
                  "-73.8762520"
              ]
          },
          {
              "place_id": 15425362,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 198924640,
              "lat": "40.746471",
              "lon": "-73.8950324",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Queens County, NY",
              "boundingbox": [
                  "40.7464280",
                  "40.7464710",
                  "-73.8954210",
                  "-73.8950324"
              ]
          },
          {
              "place_id": 15587202,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 46869112,
              "lat": "40.760078",
              "lon": "-73.8280896",
              "class": "highway",
              "type": "tertiary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Flushing Chinatown, Queens County, NY",
              "boundingbox": [
                  "40.7595609",
                  "40.7604640",
                  "-73.8301360",
                  "-73.8265410"
              ]
          },
          {
              "place_id": 395732664,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 1301675428,
              "lat": "40.7580967",
              "lon": "-73.8343208",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Flushing Chinatown, Queens County, NY",
              "boundingbox": [
                  "40.7580967",
                  "40.7581351",
                  "-73.8343208",
                  "-73.8342026"
              ]
          },
          {
              "place_id": 15488826,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 730891312,
              "lat": "40.7532491",
              "lon": "-73.8502095",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Queens County, NY",
              "boundingbox": [
                  "40.7532491",
                  "40.7533024",
                  "-73.8502095",
                  "-73.8500292"
              ]
          },
          {
              "place_id": 15521649,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 248548566,
              "lat": "40.7565446",
              "lon": "-73.8398191",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Flushing Chinatown, Queens County, NY",
              "boundingbox": [
                  "40.7565446",
                  "40.7571999",
                  "-73.8398191",
                  "-73.8382131"
              ]
          },
          {
              "place_id": 15549945,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 821193575,
              "lat": "40.7565446",
              "lon": "-73.8398191",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Queens County, NY",
              "boundingbox": [
                  "40.7558774",
                  "40.7565446",
                  "-73.8414435",
                  "-73.8398191"
              ]
          },
          {
              "place_id": 15583631,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 198595511,
              "lat": "40.7516042",
              "lon": "-73.8557528",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Corona, Queens County, NY",
              "boundingbox": [
                  "40.7507153",
                  "40.7525395",
                  "-73.8587531",
                  "-73.8525866"
              ]
          },
          {
              "place_id": 15267615,
              "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
              "osm_type": "way",
              "osm_id": 5705042,
              "lat": "40.7430424",
              "lon": "-73.916215",
              "class": "highway",
              "type": "secondary",
              "place_rank": 26,
              "importance": 0.26929955508049125,
              "addresstype": "road",
              "name": "Roosevelt Avenue",
              "display_name": "Roosevelt Avenue, Sunnyside Gardens, Queens County, NY",
              "boundingbox": [
                  "40.7430424",
                  "40.7431379",
                  "-73.9162150",
                  "-73.9158551"
              ]
          }
      ]*/
        console.log("fetched location suggestions", data)
        data.forEach((d) => {
          d.display_name = cleanAddress(d.display_name);
          // console.log(d.display_name)
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
