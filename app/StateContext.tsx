"use client";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { useAddressToCoordinates } from "./hooks/useAddressToCoordinates";
import { USDatasetSource } from "@/components/index/SearchButton";

export type LocationType = {
  lat: number;
  lon: number;
  name: string;
  display_name: string;
  addresstype: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

type State = {
  searchValue: string;
  location: LocationType | null;
  startDate: string;
  endDate: string;
  dataSource: USDatasetSource;
};

type Action =
  | { type: "updateSearchValue"; payload: string }
  | { type: "updateLocation"; payload: LocationType }
  | { type: "updateDatasource"; payload: USDatasetSource }
  | { type: "updateStartDate"; payload: string }
  | { type: "updateEndDate"; payload: string }
  | { type: "resetState"; datasource: USDatasetSource };

function reducer(state: State, action: Action): State {
  console.log("reducer called for ", action);
  switch (action.type) {
    case "updateSearchValue":
      return { ...state, searchValue: action.payload };
    case "updateLocation":
      return { ...state, location: action.payload };
    case "updateDatasource":
      return { ...state, dataSource: action.payload };
    case "updateStartDate":
      return { ...state, startDate: action.payload };
    case "updateEndDate":
      return { ...state, endDate: action.payload };
    case "resetState":
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const now = new Date().toISOString();
      return {
        searchValue: "",
        location: null,
        startDate: sevenDaysAgo,
        endDate: now,
        dataSource: action.datasource,
      };
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
}

const StateContext = createContext<
  { state: State; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

type StateProviderProps = { children: ReactNode };

function sourceSearchParamToDatasetSource(
  source: string | null
): USDatasetSource {
  if (source == null) {
    return "PFAS";
  }
  switch (source.toLowerCase()) {
    case "usgs_water":
      return "USGS_WATER";
    case "pfas":
      return "PFAS";
    case "nc_deq_watersupply":
      return "NC_DEQ_WATERSUPPLY";
    default:
      return "USGS_WATER";
  }
}

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const initialSearchValue =
    searchParams?.get("q") || searchParams?.get("query") || "";
  const initialLocation =
    searchParams?.get("location") || searchParams?.get("loc") || null;
  const { fetchCoordinates } = useAddressToCoordinates();

  const initialState: State = {
    searchValue: initialSearchValue,
    location: null,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    dataSource: sourceSearchParamToDatasetSource(
      searchParams?.get("source") ?? null
    ),
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchInitialLocation = async () => {
      if (initialLocation) {
        const returnVal = await fetchCoordinates(initialLocation);
        if (returnVal) {
          dispatch({ type: "updateLocation", payload: returnVal });
        }
      }
    };

    fetchInitialLocation();
  }, [initialLocation, fetchCoordinates]);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}
