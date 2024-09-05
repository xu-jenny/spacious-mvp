import React, { useState } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import { USGSWaterSearchResult } from "@/app/search";
import { Button } from "flowbite-react";
import { MdOutlineFileDownload } from "react-icons/md";

interface Props {
  data: USGSWaterSearchResult[];
  location: [number, number];
  startTime: string;
  endTime: string;
}

const parseCoordinates = async (
  coordinateString: string
): Promise<[number, number]> => {
  // return Raleign if no string passed
  if (coordinateString == null || coordinateString.length < 3) {
    return [35.7796, -78.6382];
  }
  const isLatLong = (str: string) => {
    const latLongRegex =
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|(1[0-7]\d|\d{1,2})(\.\d+)?)$/;
    return latLongRegex.test(str);
  };
  if (isLatLong(coordinateString)) {
    const [lat, lng] = coordinateString
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    return [lat, lng];
  } else {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        coordinateString
      )}&format=json&addressdetails=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      return [data[0].lat, data[0].lon];
    }
  }
  return [35.7796, -78.6382];
};

const PigeonMapViewer = ({ data, location, startTime, endTime }: Props) => {
  const [overlayItem, setOverlayItem] = useState<USGSWaterSearchResult | null>(
    null
  );

  const handleMouseClick = (item: USGSWaterSearchResult) => {
    setOverlayItem(item);
  };

  const handleDownload = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/usgs_water_csv/?siteId=${overlayItem?.siteId}&paramCode=${overlayItem?.matchingParamCode[1]}&startTime=${startTime}&endTime=${endTime}`,
      {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? "" },
      }
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        border: "2px solid black",
        padding: "10px",
        height: "620px",
        width: "100%",
      }}
    >
      <Map defaultZoom={12} height={600} center={location}>
        {overlayItem && (
          <Overlay
            anchor={[overlayItem.lat, overlayItem.long]}
            offset={[200, 100]}
          >
            <div className="bg-white w-60 p-2 z-50">
              <div className="flex justify-between">
                <p>{overlayItem.title}</p>
                <Button
                  size="sm"
                  className="h-10 w-10"
                  style={{ background: "none" }}
                  onClick={() => setOverlayItem(null)}
                >
                  <span className="text-black">X</span>
                </Button>
              </div>
              <MdOutlineFileDownload
                onClick={handleDownload}
                className="text-emerald-400 cursor-pointer mx-1"
                size={30}
              />
            </div>
          </Overlay>
        )}
        {data != null &&
          data.map((d: USGSWaterSearchResult, i: number) => (
            <Marker
              key={d.id}
              width={28}
              color={i == 0 ? "blue" : "red"}
              anchor={[d.lat, d.long]}
              onClick={() => handleMouseClick(d)}
            />
          ))}
        {data != null && (
          <Marker width={32} anchor={location} color={"black"} />
        )}
      </Map>
    </div>
  );
};

export default PigeonMapViewer;
