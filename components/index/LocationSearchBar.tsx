import React, { useCallback } from "react";
import GoogleSearchBar from "./GoogleSearchBar";
import DebouncedInput from "../common/DebouncedInput";
import { USDatasetSource } from "@/components/index/SearchButton";

type Props = {
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
  value?: string;
  dsSource: USDatasetSource;
};

const LocationSearchBar: React.FC<Props> = ({
  placeholder,
  value,
  onChange,
  className,
  dsSource,
}: Props) => {
  const renderSearchBar = useCallback(() => {
    switch (dsSource) {
      case "USGS_WATER":
        return (
          <GoogleSearchBar
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={className}
          />
        );
      default:
        return <DebouncedInput placeholder={placeholder} onChange={onChange} />;
    }
  }, [dsSource, placeholder, value, onChange, className]);

  return <>{renderSearchBar()}</>;
};

export default LocationSearchBar;
