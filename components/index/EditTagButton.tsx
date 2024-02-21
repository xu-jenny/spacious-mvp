import { primaryTagSearch } from "@/app/indexUtils";
import { logTableInteraction } from "@/utils/supabaseLogger";
import { Button } from "flowbite-react";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { Spinner } from 'flowbite-react';

type Props = {
  location: string;
  setPrimaryData: (data: any[]) => void;
  placeHolder?: string;
};

const EditTagButton = ({ location, setPrimaryData, placeHolder="Edit Primary Tag" }: Props) => {
  const [editTag, setEditTag] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    if (editTag && editTag.length > 2) {
      setLoading(true);
      let primaryData = await primaryTagSearch(editTag, location);
      console.log("newley returend primaryData: " + primaryData);
      setPrimaryData(primaryData);
      if (process.env.NODE_ENV === "production") {
        logTableInteraction(
          "EditTag",
          0,
          editTag
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-30 flex flex-row p-2">
      {loading ? <Spinner /> : <>
      <input
        placeholder={placeHolder}
        type="text"
        className="text-sm bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={editTag}
        onChange={(e) => setEditTag(e.target.value)}
      />
      <Button outline onClick={onSubmit}>
        <FaCheck className="h-6 w-6" />
      </Button></>}
    </div>
  );
};

export default EditTagButton;
