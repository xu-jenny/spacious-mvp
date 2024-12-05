import React from "react";
import { Popover } from "flowbite-react";
import { FiInfo } from "react-icons/fi";
import { LocationType } from "@/app/StateContext";

type LocationInfoProps = {
  locationName: string;
  locationDetails: LocationType;
  isLoading: boolean;
};

const LocationInfo: React.FC<LocationInfoProps> = ({
  locationName,
  locationDetails,
  isLoading,
}) => {
  const { address } = locationDetails;
  const city =
    address?.city || address?.town || address?.village || "Unknown City";

  const hasValidAddress =
    address?.house_number ||
    address?.road ||
    address?.city ||
    address?.county ||
    address?.state ||
    address?.postcode;

  const popoverContent = (
    <div className="w-64 text-sm text-black dark:text-gray-400">
      <div className="rounded-md border-gray-200 bg-blue-700 px-3 py-1 dark:border-gray-600 dark:bg-gray-700">
        <h3
          id="location-info-popover"
          className="font-medium text-white dark:text-white text-base"
        >
          {locationName}
        </h3>
      </div>
      <div className="px-3 py-1">
        {address ? (
          <>
            <p>
              Address: {address.house_number || ""} {address.road || ""}
            </p>
            <p>City: {city}</p>
            <p>County: {address?.county || "Unknown"}</p>
            <p>State: {address?.state || "Unknown"}</p>
            <p>Postcode: {address?.postcode || "Unknown"}</p>
          </>
        ) : (
          <p>No detailed address information available.</p>
        )}
      </div>
    </div>
  );

  return hasValidAddress ? (
    <Popover
      aria-labelledby="location-info-popover"
      placement="right"
      trigger="hover"
      arrow={false}
      content={popoverContent}
    >
      <button>
        {isLoading ? (
          <div
            className="spinner border-2 border-blue-500 border-t-transparent rounded-full w-4 h-4 animate-spin"
            aria-label="Loading"
          ></div>
        ) : (
          <FiInfo className="text-gray-500 dark:text-gray-400 ml-2" size={18} />
        )}
      </button>
    </Popover>
  ) : (
    <button>
      {isLoading ? (
        <div
          className="spinner border-2 border-blue-500 border-t-transparent rounded-full w-4 h-4 animate-spin"
          aria-label="Loading"
        ></div>
      ) : (
        <FiInfo className="text-gray-500 dark:text-gray-400 ml-2" size={18} />
      )}
    </button>
  );
};

export default LocationInfo;
