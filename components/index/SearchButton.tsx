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
  setQuery: (value: string) => void;
  dsSource: USDatasetSource | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  startTime?: string
  endTime?: string
  initalVal?: string | null;
};
export async function search(value: string, location: string, dsSource: USDatasetSource | null, startTime?: string, endTime?: string){
  switch (dsSource){
    case 'USGS_WATER':
      // TODO: we should handle these input cases being null in front end
      if (startTime != null && endTime != null){
        return await usgsWaterSearch(value, location, startTime, endTime);    
      }
    case 'NC_DEQ_WATERSUPPLY':
      if (location != null){
        return await NCDEQWSSearch(value, location)
      }
    default:
      return await searchbarSearch(value, location, dsSource);
    }
}

const SearchButton = ({
  location,
  dsSource,
  setPrimaryData,
  setQuery,
  setLoading,
  startTime,
  endTime,
  initalVal
}: Props) => {
  const onSubmit = async (value: string) => {
    if (value && value.length > 2) {
      setLoading(true);
      setQuery(value);
      let primaryData = await search(value, location, dsSource, startTime, endTime);
      setPrimaryData(primaryData ?? []);
      if (process.env.NODE_ENV === "production") {
        logTableInteraction("EditTag", 0, value);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-30 flex flex-row p-2">
      <SearchBar onSubmit={onSubmit} placeHolder={"Enter a search term..."} initalVal={initalVal} setQuery={setQuery}/>
    </div>
  );
};

export default SearchButton;
