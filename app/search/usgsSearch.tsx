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
  "Precipitation",
  "Gage height",
  "Discharge",
  "Temperature, water",
  "Temperature, air",
  "Temperature, soil",
  "Water level, depth LSD",
  "Absolute pressure from unvented pressure transducer",
  "Acoustic Doppler Velocity Meter signal to noise ratio",
  "Air gap",
  "Atmospheric water vapor density",
  "Barometric pressure",
  "Stream water level elevation above NAVD 1988",
  "Stream water level elevation above NGVD 1929",
  "Water level above marsh",
  "Water level elevation above gage datum, corrected for barometric pressure",
  "Gate opening, height",
  "Gate opening, width",
  "Gate openings, reservoir, all gates",
  "Turbidity",
  "Carbon dioxide, soil gas",
  "Carbon dioxide, water",
  "Reservoir storage",
  "Suspended sediment concentration",
  "Suspended sediment concentration, water",
  "Suspended sediment load, water",
  "Phosphate, water, unfiltered",
  "Phosphorus, water, filtered",
  "Lake or reservoir elevation",
  "Lake or reservoir water surface elevation",
  "Estuary or ocean water surface elevation",
  "Bulk electrical conductance, soil",
  "pH",
  "Snow depth",
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
  Precipitation: [
    ["00045", "in"],
    ["72192", "in"],
    ["72194", "milimeters"],
    ["99772", "milimeters"],
  ],
  "Temperature, water": [
    ["00010", "Degrees Celsius"],
    ["00011", "Degrees Fahrenheit"],
  ],
  "Temperature, soil": [["62846", "Degrees Fahrenheit"]],
  "Gage height": [["00065", "Feet"]],
  Discharge: [
    ["00060", "Cubic Feet per Second"],
    ["30208", "Cubic Meters per Second"],
    ["50042", "Gallons per minute"],
    ["72137", "tidally filtered"],
  ],
  "Stream water level elevation above NAVD 1988": [["63160", "Feet"]],
  "Stream water level elevation above NGVD 1929": [["63158", "Feet"]],
  "Water level above marsh": [["72251", "Feet"]],
  "Water level elevation above gage datum, corrected for barometric pressure": [
    ["72293", "Feet"],
  ],
  "Water level, depth LSD": [["72019", "Feet"]],
  "Gate opening, height": [["45592", "Feet"]],
  "Gate opening, width": [["45585", "Feet"]],
  "Gate openings, reservoir, all gates": [["45700", "Feet"]],
  Turbidity: [
    ["72213", "FBRU"],
    ["63680", "_FNU"],
    [
      "63675",
      "water, unfiltered, broad band light source [400-680 nm], detection angle 90 +-30 degrees to incident light, nephelometric turbidity units [NTU)",
    ],
    [
      "72337",
      "water, unfiltered, monochrome near infra-red LED light, 780-900 nm, detection angle 135-180 degrees, SDVB [styrene divinylbenzene beads) backscatter units[SBU)",
    ],
    [
      "63680",
      "water, unfiltered, monochrome near infra-red LED light, 780-900 nm, detection angle 90 +-2.5 degrees, formazin nephelometric units [FNU)",
    ],
  ],
  "Carbon dioxide, soil gas": [
    ["54158", "corrected for temperature and pressure, percent of soil gas"],
    [
      "54158",
      "in situ, sensor reading corrected for temperature and pressure, percent of soil gas",
    ],
    [
      "54153",
      "in situ, sensor reading uncorrected for temperature and pressure, percent of soil gas",
    ],
  ],
  "Carbon dioxide, water": [
    [
      "72240",
      "dissolved, at the water surface, parts per million by volume of dissolved gases",
    ],
  ],
  "Reservoir storage": [
    ["72036", ""],
    ["00054", "Acre feet"],
    ["thosand acre feet", "72036"],
  ],
  "Suspended sediment concentration": [["80154", "Milligrams per Liter"]],
  "Suspended sediment concentration, water": [
    [
      "80300",
      "unfiltered, at a fixed point in stream, estimated by a regression equation with turbidity, Milligrams per Liter",
    ],
    [
      "99409",
      "unfiltered, estimated by regression equation, Milligrams per Liter",
    ],
  ],
  "Suspended sediment load, water": [
    [
      "80297",
      "unfiltered, computed, the product of regression-computed suspended sediment concentration and streamflow, Tons per Day",
    ],
    [
      "80298",
      "unfiltered, regression computed, turbidity and streamflow as regressors, Tons per Day",
    ],
  ],
  "Phosphate, water, unfiltered": [
    ["91050", "Pounds per day"],
    ["00650", "as PO4, Milligrams per Liter"],
    [
      "99146",
      "estimated by regression equation as phosphorus, Milligrams per Liter",
    ],
  ],
  "Phosphorus, water, filtered": [["00666", "Milligrams per Liter"]],
  "Lake or reservoir elevation": [
    ["72214", "above International Great Lakes Datum (IGLD), Feet"],
    ["72264", "above New York State Barge Canal Datum (NYBCD), Feet"],
    [
      "72275",
      "above United States Bureau of Reclamation Klamath Basin (USBRKB) Datum, Feet",
    ],
    ["72375", "elevation above local mean sea level (LMSL), Feet"],
    ["72376", "elevation above local mean sea level (LMSL), meters, Meters"],
    ["72380", "above Puerto Rico Datum of 2002, Meters"],
    ["72379", "above Puerto Rico Datum of 2002, Feet"],
  ],
  "Lake or reservoir water surface elevation": [
    ["62615", "above NAVD 1988, Feet"],
    ["62614", "above NAVD 1920, Feet"],
  ],
  "Estuary or ocean water surface elevation": [
    ["62620", "above NAVD 1988, Feet"],
    ["62619", "above NGVD 1929, Feet"],
  ],
  "Bulk electrical conductance, soil": [["72205", "decisiemens per meter"]],
  pH: [["00400", "ph Units"]],
  "Snow depth": [
    ["72198", "Feet"],
    ["72189", "Meters"],
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

export function getUnitsByParamCode(paramCode: string): string | null {
  // given 00065, return "feet"
  for (const category of Object.values(USGS_PARAM_CODES)) {
    const match = category.find(([code]) => code === paramCode);
    if (match) {
      return match[1]; // Return the unit
    }
  }
  return null;
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
    const matchParamCode = inputParamCodes.find((t) => t == response.dataType);
    if (matchParamCode != null) {
      result["unit"] = getUnitsByParamCode(matchParamCode);
      result["matchingParamCode"] = matchParamCode;
    }

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
