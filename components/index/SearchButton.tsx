import React, { useEffect, useRef, useState } from "react";
import { NCDEQWSSearch } from "@/app/search/NCDEQWSSearch";
import Input from "../common/Input";
import { LocationType, useStateContext } from "@/app/StateContext";
import { useAuthStateContext } from "@/components/AuthStateContext";
import ToastNotification from "@/components/common/ToastNotification";
import { useLogger } from "@/utils/supabaseLogger";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  USGS_DROPDOWN_SELECTION,
  usgsWaterSearch,
} from "@/app/search/usgsSearch";
import { StreamingResponseRef } from "./StreamingResponse";

export type USDatasetSource =
  | "PFAS"
  | "LASERFICHE"
  | "USGS"
  | "USGOV"
  | "NYOPEN"
  | "USGS_WATER"
  | "NC_DEQ_WATERSUPPLY"
  | "ANY";

// Access levels for each data source
export const DATA_SOURCE_ACCESS_LEVELS: Record<USDatasetSource, number> = {
  PFAS: 1,
  LASERFICHE: 0,
  USGS: 0,
  USGOV: 0,
  NYOPEN: 0,
  USGS_WATER: 0,
  NC_DEQ_WATERSUPPLY: 0,
  ANY: 0,
};

const hasAccess = (
  dsSource: USDatasetSource,
  userRole: number | null
): boolean => {
  const requiredTier = DATA_SOURCE_ACCESS_LEVELS[dsSource];
  return userRole !== null && userRole >= requiredTier;
};

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  streamingResponseRef: React.RefObject<StreamingResponseRef>;
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
      if (startTime != null && endTime != null && location != null) {
        return await usgsWaterSearch(
          value,
          `${location.lat},${location.lon}`,
          startTime,
          endTime
        );
      }
      break;
    case "NC_DEQ_WATERSUPPLY":
      if (location != null) {
        return await NCDEQWSSearch(value, location.name);
      }
      break;
  }
}

const SearchButton = ({ setLoading, loading, streamingResponseRef }: Props) => {
  const { state, dispatch } = useStateContext();
  const { role } = useAuthStateContext();
  const [searchValue, setSearchValue] = useState<string>(state.searchValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const logger = useLogger();

  const isDisabled = !hasAccess(state.dataSource ?? "ANY", role);

  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const searchButtonText =
    state.dataSource == "USGS_WATER" ? "Enter a data type" : "Ask a question";
  const placeholderText = isDisabled
    ? "This data source requires a subscription. Please contact Spacious to get started."
    : searchButtonText;

  useEffect(() => {
    setSearchValue("");
  }, [state.dataSource]);

  const onSubmit = async (value: string) => {
    if (isDisabled) {
      return;
    }
    // console.log(state.location, state.location?.name);
    if (state.location == null) {
      // || !state.location.name) {
      setToastConfig({
        message: "Please enter a location before searching.",
        type: "warning",
      });
      setTimeout(() => setToastConfig(null), 3000);
      return;
    }
    if (value && value.length > 2) {
      console.log(state.dataSource, value, state.location?.name);
      if (state.dataSource == "PFAS") {
        const body = {
          query: value,
          location: state.location?.name ?? "",
        };
        streamingResponseRef.current?.startStream(
          `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche`,
          body
        );
      } else {
        setLoading(true);
        let primaryData = await search(
          value,
          state.location,
          state.dataSource,
          state.startDate,
          state.endDate
        );
        if (primaryData != undefined) {
          dispatch({
            type: "updateSearchResults",
            payload: primaryData,
          });
        }
        dispatch({ type: "updateSearchValue", payload: value });
        setLoading(false);
        inputRef.current?.blur();
        try {
          logger.log("Search", value, `${state.location},${state.dataSource}`);
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(searchValue);
    }
  };

  return (
    <div className="w-30 flex flex-row p-2 relative">
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          {loading ? (
            <div className="spinner" aria-label="Loading"></div>
          ) : (
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
          )}
        </div>
        {state.dataSource == "USGS_WATER" ? (
          <Autocomplete
            disablePortal
            options={USGS_DROPDOWN_SELECTION}
            sx={{ width: "100%" }}
            onInputChange={(event, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  "& .MuiInputBase-input": {
                    backgroundColor: "aliceblue",
                  },
                }}
              />
            )}
          />
        ) : (
          <Input
            ref={inputRef}
            type="search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={placeholderText}
            value={searchValue ?? ""}
            onkeydown={handleKeyDown}
            onChange={(v: string) => setSearchValue(v)}
            disabled={isDisabled}
          />
        )}
        <button
          type="submit"
          className={`text-white absolute end-2.5 bottom-2.5 ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800"
          } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
          onClick={(e) => {
            e.preventDefault();
            onSubmit(searchValue);
          }}
          disabled={isDisabled}
        >
          Search
        </button>
      </div>
      {toastConfig && (
        <ToastNotification
          message={toastConfig.message}
          type={toastConfig.type}
          duration={3000}
        />
      )}
    </div>
  );
};

export default SearchButton;
