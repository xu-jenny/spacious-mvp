import { post } from "@/utils/http";

// Gage height                                              7321
// Discharge                                                5919
// Gage height, feet                                        3773
// Discharge, cubic feet per second                         2867
// Stream water level elevation above NAVD 1988, in feet    2237
// None                                                     2075
// Temperature, water                                       1278
// Precipitation, total, inches                             1072
// Temperature, water, degrees Celsius                      1066
// Water level, depth LSD                                   1062

export const USGS_DROPDOWN_SELECTION = [
  "Absolute pressure from unvented pressure transducer",
  "Acoustic Doppler Velocity Meter signal to noise ratio",
  "Air gap",
  "Atmospheric water vapor density",
  "Barometric pressure",
  "Temperature, air",
];

// make sure the first item is the most frequently accessed
export const USGS_PARAM_CODES: Record<string, string[][]> = {
  "Absolute pressure from unvented pressure transducer": [
    ["72203", "Pounds per Square Inch"],
  ],
  "Acoustic Doppler Velocity Meter signal to noise ratio": [
    ["99237", "Number"],
  ],
  "Air gap": [["72320", "Feet"]],
  "Atmospheric water vapor density": [
    ["72182", "grams per cubic meter"],
    ["72125", "kilopascals"],
    ["72398", "millibars"],
  ],
  "Barometric pressure": [
    ["00025", "mmHg"],
    ["72204", "Uncorrected, Pounds per Square Inch"],
    ["62602", "corrected to sea level, inches of mercury"],
    ["62605", "corrected, inches of water"],
    ["72412", "uncorrected, hectopascals"],
    ["62607", "uncorrected, kilopascals"],
  ],
  "Temperature, air": [
    ["00020", "Degrees Celsius"],
    ["00021", "Degrees Fahrenheit"],
  ],
};

export type USGSWaterSearchResult = {
  title: string;
  id: string;
  siteId: string;
  summary: string;
  lat: number;
  long: number;
  distanceFromInput: number;
  dataTypes: string;
  county: string | null;
  stateCode: string | null;
  matchingParamCode: string;
  csv_dl_link?: string;
  unit?: string | null;
  sample_df?: {
    datetime: string;
    value: number;
  }[];
};

function round(num: number, fractionDigits: number): number {
  if (num == null) {
    return 0;
  }
  return Number(num.toFixed(fractionDigits));
}

function postprocessSupabaseResponse(response: any, inputParamCodes: string[]) {
  let rows = response.rows;
  if (rows == null || rows.length == 0) {
    return [];
  }
  let sample_df = response.sample;
  let dl_link = `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/download-csv/${response.csv_id}`;

  let data: USGSWaterSearchResult[] = [];
  rows.forEach((row: { [x: string]: any }, i: number) => {
    let result: USGSWaterSearchResult = {
      id: row["iotid"],
      title: row["locationname"],
      distanceFromInput: round(row["distance"] / 1600, 2),
      summary: "",
      lat: row["latitude"],
      long: row["longitude"],
      dataTypes: "",
      county: row["county"],
      stateCode: row["statecode"],
      siteId: "",
      matchingParamCode: inputParamCodes[0][0],
    };

    result["summary"] = `This is a ${
      row["datatype"]
    } Station, it's located at ${row["locationname"]} (${round(
      row["latitude"],
      4
    )}, ${round(row["longitude"], 4)}).`;

    result["siteId"] = result["id"].slice(5);
    // find unit
    const matchParamCode = inputParamCodes.find(
      (t) => t[0] == response.dataType
    );
    console.log(matchParamCode, inputParamCodes, response.dataType);
    if (matchParamCode != null) {
      result["unit"] = matchParamCode[1];
      result["matchingParamCode"] = matchParamCode[0];
    }

    // const cleanedString = row["paramcodes"].slice(1, -1);
    // const tupleStrings = cleanedString.split("), ("); // Split by "), ("

    // tupleStrings.map((tupleStr: string) => {
    //   const cleanedTuple = tupleStr.replace(/[\(\)]/g, ""); // Remove any remaining parentheses
    //   const [first, second] = cleanedTuple
    //     .split("', '")
    //     .map((item) => item.replace(/^'|'$/g, "").trim()); // Split and remove quotes
    //   if (first.toLowerCase().includes(keyword.toLowerCase())) {
    //     result["matchingParamCode"] = [first, second];
    //   }
    //   return [first, second];
    // });

    // try {
    //   const tuples =
    //     row["paramcodes"]
    //       .match(/\('(.*?)', '.*?'\)/g)
    //       ?.map((tupleStr: string) => {
    //         const match = tupleStr.match(/\('(.*?)', '.*?'\)/);
    //         return match ? match[1] : "";
    //       }) || [];
    //   // find unit
    //   const processedSegments = tuples.map((segment: string) => {
    //     const parts = segment.split(", ");
    //     if (parts.length > 1) {
    //       const firstPart = parts[0];
    //       const remainingParts = parts.slice(1).join(", ");
    //       if (i == 0 && segment.toLowerCase().includes(keyword.toLowerCase())) {
    //         result["unit"] = `${firstPart} (${remainingParts})`;
    //       }
    //       return `${firstPart} (${remainingParts})`;
    //     }
    //     return segment;
    //   });
    //   result["dataTypes"] = processedSegments.join(" | ");
    //   result["summary"] +=
    //     ` \n\nAvailable data at station: ${result["dataTypes"]}`;
    // } catch {
    //   console.log("error parsing paramCodes", row);
    // }
    if (i == 0) {
      result["csv_dl_link"] = dl_link;
      result["sample_df"] = sample_df;
    }
    data.push(result);
  });
  console.log(data);
  return data;
}

export async function usgsWaterSearch(
  keyword: string,
  location: string,
  startTime: string,
  endTime: string
): Promise<USGSWaterSearchResult[]> {
  console.log("location: ", location);
  console.log("keyword: ", keyword);
  // find the paramcode from keyword
  if (keyword in USGS_PARAM_CODES) {
    const paramCode: string[] = USGS_PARAM_CODES[keyword].map(
      (tuple) => tuple[0]
    );
    console.log(paramCode);
    let response = await post(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/usgs_water`,
      {
        location,
        startTime,
        endTime,
        paramCode,
      }
    );
    console.log(response);
    if (!response || !response.rows) {
      console.error("Unexpected response structure:", response);
      return [];
    }
    return postprocessSupabaseResponse(response, paramCode);
  }
  return [];
}
