import { logTableInteraction } from "@/utils/supabaseLogger";
import SearchBar from "../common/SearchBar";
import { searchbarSearch } from "@/app/search";

export type USDatasetSource = "USGS" | "USGOV" | "LASERFICHE" | "NYOPEN";

type Props = {
  location: string;
  setPrimaryData: (data: any[]) => void;
  dsSource: USDatasetSource | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditTagButton = ({
  location,
  dsSource,
  setPrimaryData,
  setLoading,
}: Props) => {
  const onSubmit = async (value: string) => {
    if (value && value.length > 2) {
      setLoading(true);
      let primaryData = await searchbarSearch(
        value,
        location,
        dsSource
      );
      setPrimaryData(primaryData);
      if (process.env.NODE_ENV === "production") {
        logTableInteraction("EditTag", 0, value);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-30 flex flex-row p-2">
      <SearchBar onSubmit={onSubmit} placeHolder="Enter a tag.." />
    </div>
  );
};

export default EditTagButton;
