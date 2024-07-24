import { logTableInteraction } from "@/utils/supabaseLogger";
import SearchBar from "../common/SearchBar";
import { searchbarSearch, usgsWaterSearch } from "@/app/search";
import { NCDEQWSSearch } from "@/app/NCDEQWSSearch";

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
  location: string;
  setPrimaryData: (data: any[]) => void;
  dsSource: USDatasetSource | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  startTime?: string
  endTime?: string
};

const SearchButton = ({
  location,
  dsSource,
  setPrimaryData,
  setLoading,
  startTime,
  endTime,
}: Props) => {
  const onSubmit = async (value: string) => {
    if (value && value.length > 2) {
      setLoading(true);
      let primaryData;
      switch (dsSource){
        case 'USGS_WATER':
          // TODO: we should handle these input cases being null in front end
          if (startTime != null && endTime != null){
            primaryData = await usgsWaterSearch(value, location, startTime, endTime);    
            break;
          }
        case 'NC_DEQ_WATERSUPPLY':
          if (location != null){
            const year = parseInt(startTime ?? "0")
            primaryData = await NCDEQWSSearch(location, value, year)
            break;
          }
        default:
          primaryData  = await searchbarSearch(value, location, dsSource);
        }
      setPrimaryData(primaryData ?? []);
      if (process.env.NODE_ENV === "production") {
        logTableInteraction("EditTag", 0, value);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-30 flex flex-row p-2">
      <SearchBar onSubmit={onSubmit} placeHolder="Enter a search term.." />
    </div>
  );
};

export default SearchButton;
