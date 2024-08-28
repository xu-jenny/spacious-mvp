import { logTableInteraction } from "@/utils/supabaseLogger";
import {
  laserficheSearch,
  searchbarSearch,
  usgsWaterSearch,
} from "@/app/search";
import { NCDEQWSSearch } from "@/app/NCDEQWSSearch";
import Input from "../common/Input";
import { LocationType, useStateContext } from "@/app/StateContext";
import { useState } from "react";

export type USDatasetSource =
  | "PFAS"
  | "LASERFICHE"
  | "USGS"
  | "USGOV"
  | "NYOPEN"
  | "USGS_WATER"
  | "NC_DEQ_WATERSUPPLY"
  | "ANY";

type Props = {
  setPrimaryData: (data: any[]) => void;
  dsSource: USDatasetSource | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  startTime?: string;
  endTime?: string;
};
export async function search(
  value: string,
  location: LocationType | null,
  dsSource: USDatasetSource | null,
  startTime?: string,
  endTime?: string
) {
  switch (dsSource) {
    case "USGS_WATER":
      // TODO: we should handle these input cases being null in front end
      if (startTime != null && endTime != null && location != null) {
        // TODO: handle this in UI
        return await usgsWaterSearch(
          value,
          `${location.lat},${location.lon}`,
          startTime,
          endTime
        );
      }
    case "NC_DEQ_WATERSUPPLY":
      if (location != null) {
        return await NCDEQWSSearch(value, location.name);
      }
    case "PFAS":
      const loc = location?.name ?? "ncs000050";
      console.log(loc, location?.name);
      return laserficheSearch(value, loc);
    default:
      return await searchbarSearch(value, location?.name ?? "", dsSource);
  }
}

const SearchButton = ({
  dsSource,
  setPrimaryData,
  setLoading,
  startTime,
  endTime,
}: Props) => {
  const { state, dispatch } = useStateContext();
  const [searchValue, setSearchValue] = useState<string>(state.searchValue);

  const onSubmit = async (value: string) => {
    if (value && value.length > 2) {
      // TODO: show error message for invalid input
      setLoading(true);
      let primaryData = await search(
        value,
        state.location,
        dsSource,
        startTime,
        endTime
      );
      setPrimaryData(primaryData ?? []);
      dispatch({ type: "updateSearchValue", payload: value });
      if (process.env.NODE_ENV === "production") {
        logTableInteraction("EditTag", 0, value);
      }
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(searchValue);
    }
  };

  return (
    <div className="w-30 flex flex-row p-2">
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <Input
          type="search"
          className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={"Enter a search term"}
          value={searchValue ?? ""}
          onkeydown={handleKeyDown}
          onChange={(v: string) => setSearchValue(v)}
        />
        <button
          type="submit"
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={(e) => onSubmit(searchValue)}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchButton;
