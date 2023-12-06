import { useEffect, useState } from "react";
import { addDataRequest } from "@/utils/supabaseLogger";
import Button from "../common/Button";

type Props = {
  query: string;
  aiMessage: string;
};

const RequestDatasetButton = ({ query, aiMessage }: Props) => {
  const [success, setSuccess] = useState<boolean>(false);

  const onSubmit = async () => {
    await addDataRequest(query, aiMessage);
  };

  return (
    <div className="w-30">
      <Button text="Request Data" theme="primary" onClick={onSubmit} />
      {success && (
        <span>Data requuest sent. Thank you for making Spacious Better!</span>
      )}
    </div>
  );
};

export default RequestDatasetButton;
