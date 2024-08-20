import { useState } from "react";
import OpenLinkButton from "./RequestDataButton";

const RequestDataBanner = () => {
  const [isShowingInput, setIsShowingInput] = useState<boolean>(false);
  return (
    <span className="hover:cursor-pointer py-4 text-blue-700 hover:text-blue-600 hover:underline items-center align-middle">
      Can not find what you are looking for?
    </span>
  );
};

export default RequestDataBanner;
