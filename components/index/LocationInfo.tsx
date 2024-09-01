import React from "react";
import { Popover } from "flowbite-react";
import { FiInfo } from "react-icons/fi";
import { LocationType } from "@/app/StateContext";

type LocationInfoProps = {
  locationName: string;
  locationDetails: LocationType;
};

const LocationInfo: React.FC<LocationInfoProps> = ({
  locationName,
  locationDetails,
}) => {
  const { address } = locationDetails;
  const city =
    address?.city || address?.town || address?.village || "Unknown City";

  return (
    <Popover
      aria-labelledby="location-info-popover"
      placement="right"
      trigger="hover"
      arrow={false}
      content={
        <div className="w-64 text-sm text-black dark:text-gray-400">
          <div className=" rounded-md border-gray-200 bg-blue-700 px-3 py-1 dark:border-gray-600 dark:bg-gray-700">
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
      }
    >
      <button>
        <FiInfo className="text-gray-500 dark:text-gray-400 ml-2" size={18} />
      </button>
    </Popover>
  );
};

export default LocationInfo;
