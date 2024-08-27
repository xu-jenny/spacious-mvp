import React from "react";
import { Popover } from "flowbite-react";
import { FiInfo } from "react-icons/fi";

type LocationInfoProps = {
  locationName: string;
  locationDetails: {
    display_name: string | null;
  };
};

const LocationInfo: React.FC<LocationInfoProps> = ({
  locationName,
  locationDetails,
}) => {
  const parseLocation = (display_name: string | null) => {
    if (!display_name) return { address: "", city: "", county: "", state: "" };

    const parts = display_name.split(",").map((part) => part.trim());

    const state = parts[parts.length - 1] || "";
    const county = parts[parts.length - 2] || "";
    const city = parts[parts.length - 3] || "";
    const address = parts.slice(0, 2).join(" ") || "";

    return { address, city, county, state };
  };

  const { address, city, county, state } = parseLocation(
    locationDetails.display_name
  );

  return (
    <Popover
      aria-labelledby="location-info-popover"
      placement="right"
      content={
        <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
          <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
            <h3
              id="location-info-popover"
              className="font-medium text-gray-900 dark:text-white text-base"
            >
              {locationName}
            </h3>
          </div>
          <div className="px-3 py-2">
            <p>
              <strong>Address:</strong> {address}
            </p>
            <p>
              <strong>City:</strong> {city}
            </p>
            <p>
              <strong>County:</strong> {county}
            </p>
            <p>
              <strong>State:</strong> {state}
            </p>
          </div>
        </div>
      }
    >
      <button>
        <FiInfo className="text-gray-500 dark:text-gray-400 ml-2" size={18} />
      </button>
    </Popover>
  );
};

export default LocationInfo;
