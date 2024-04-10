import { primaryTagSearch } from "@/app/indexUtils";
import { logTableInteraction } from "@/utils/supabaseLogger";
import SearchBar from "../common/SearchBar";

export type USDatasetSource = "USGS" | "USGOV" | "LASERFICHE" | "NYOPEN";

type Props = {
  location: string;
  setPrimaryData: (data: any[]) => void;
  dsSource: USDatasetSource | null;
  domain: string | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditTagButton = ({
  location,
  dsSource,
  domain,
  setPrimaryData,
  setLoading,
}: Props) => {
  const onSubmit = async (value: string) => {
    if (value && value.length > 2) {
      setLoading(true);
      let primaryData = await primaryTagSearch(
        value,
        `%${location}%`,
        dsSource,
        domain
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
      {/* <input
        placeholder="Edit Primary Tag"
        type="text"
        className="text-sm bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={editTag}
        onChange={(e) => setEditTag(e.target.value)}
      />
      <Button outline onClick={onSubmit}>
        <FaCheck className="h-6 w-6" />
      </Button> */}
    </div>
  );
};

export default EditTagButton;
