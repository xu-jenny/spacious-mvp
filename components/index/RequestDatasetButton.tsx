import { addDataRequest } from "@/utils/supabaseLogger";

type Props = {
  query: string;
  aiMessage: string;
};

const RequestDatasetButton = ({ query, aiMessage }: Props) => {
  const [success, setSuccess] = setState<boolean>(false);

  const onSubmit = async () => {
    await addDataRequest(query, aiMessage);
  }

  return (
    <>
      <Button text="Request Data" theme="outline" onClick={onSubmit} />
      {success && <span>Data requuest sent. Thank you for making Spacious Better!</span>}
    </>
  );
};

export default RequestDatasetButton
