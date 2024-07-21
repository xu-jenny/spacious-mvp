import React from "react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

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
      <Fab size="small" color="primary" aria-label="add" onClick={onClick}>
        <AddIcon />
      </Fab>
    </div>
  );
};

export default OpenLinkButton;
