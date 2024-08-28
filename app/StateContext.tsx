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
};

type Action =
  | { type: "updateSearchValue"; payload: string }
  | { type: "updateLocation"; payload: LocationType };

function reducer(state: State, action: Action): State {
  console.log("reducer callled for ", action);
  switch (action.type) {
    case "updateSearchValue":
      return { ...state, searchValue: action.payload };
    case "updateLocation":
      return { ...state, location: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
}

const StateContext = createContext<
  { state: State; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

type StateProviderProps = { children: ReactNode };

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const initialSearchValue =
    searchParams.get("q") || searchParams.get("query") || "";
  const initialLocation =
    searchParams.get("location") || searchParams.get("loc") || null;
  const { fetchCoordinates } = useAddressToCoordinates();

  const initialState: State = {
    searchValue: initialSearchValue,
    location: null,
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
