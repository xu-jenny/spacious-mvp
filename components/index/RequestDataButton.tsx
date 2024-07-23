import React from "react";
import { Button } from "flowbite-react";

const OpenLinkButton = () => {
  const onClick = () => {
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSdN0oChtUybmYKpA-CYYS4_G_Sfofc5onEEoCSX9Pn7oFZBlw/viewform",
      "_blank",
      "width=800,height=600"
    );
  };

  return (
    <div className="w-30">
      <button
        type="submit"
        className="text-white absolute bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={onClick}
      >
        Request Data
      </button>
    </div>
  );
};

export default OpenLinkButton;
