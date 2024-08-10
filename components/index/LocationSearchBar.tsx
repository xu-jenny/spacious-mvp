import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import GoogleSearchBar from "./GoogleSearchBar";
import { USDatasetSource } from "@/components/index/SearchButton";
import Input from "../common/Input";
import { useStateContext } from "@/app/StateContext";
import { useAddressToCoordinates } from "@/app/hooks/useAddressToCoordinates";
import DebouncedInput from "../common/DebouncedInput";
import { useSearchParams } from "next/navigation";

type Props = {
  placeholder?: string;
  className?: string;
  // invokeLocUpdateDispatch:(val: string) => void;
  dsSource: USDatasetSource;
};

// const [value, setValue] = useState<string>(state.location.display_name);
// TODO: we need to lift dispatch coordinates to parent, so search bar can invoke it if it's submitted
const DefaultLocationInput = () => { 
  const searchParams = useSearchParams();
  const urlLocation = searchParams.get('location') || searchParams.get('loc')
  const { state, dispatch } = useStateContext();
  const { fetchCoordinates, loading } = useAddressToCoordinates();

  const onSubmit = async (location: string) => {
    let coordinates = null;
    coordinates = await fetchCoordinates(location);
    // console.log("location search:", coordinates)
    if (!loading && coordinates) {
      // console.log("dispatching update location", coordinates);
      dispatch({ type: "updateLocation", payload: coordinates });
    }
  }

  return (<DebouncedInput
    // onChange={setValue}
    onDebounceChange={onSubmit}
    initalValue={state.location?.name ?? urlLocation ?? ""}
    placeholder={"Enter region/address/coordinates"} 
    timeout={1000} />)
}

const LocationSearchBar: React.FC<Props> = ({
  placeholder,
  className,
  dsSource,
}: Props) => {
  const renderSearchBar = useCallback(() => {
    switch (dsSource) {
      case "USGS_WATER":
        if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== undefined) {
          return (
            <GoogleSearchBar
              placeholder={placeholder}
              className={className}
            />
          );
        }
      default:
        return <DefaultLocationInput />;
    }
  }, [dsSource, placeholder, className]);

  return <>{renderSearchBar()}</>;
};

export default LocationSearchBar;
