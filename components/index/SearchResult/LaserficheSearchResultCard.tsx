"use client";

import * as React from "react";
import {
  LaserfichePageResult,
  LaserficheSearchResult,
} from "@/app/search/search";
import { useLogger } from "@/utils/supabaseLogger";
import Badge from "@mui/material/Badge";
import ImageIcon from "@mui/icons-material/Image";

import { Card } from "flowbite-react";
// import MailIcon from "@mui/icons-material/Mail";

type Props = {
  dataset: LaserficheSearchResult;
  index: number;
  setSelectedDataset: (x: LaserficheSearchResult) => void;
  panelIsOpen: boolean;
};

function LaserficheSearchResultCard({
  dataset,
  index,
  setSelectedDataset,
  panelIsOpen,
}: Props) {
  const logger = useLogger();
  const logLinkClick = (data: LaserficheSearchResult, index: number) => {
    logger.log("LinkClick", data.title.toString(), index.toString());
    setSelectedDataset(data);
  };
  const longStringShortener = (str: string) =>
    str != null && str.length > 300 ? `${str.substring(0, 300)}...` : str;

  const showNodes = (nodes: LaserfichePageResult[]) => {
    return <p>We found {nodes.length} potential matches in this document</p>;
  };

  const showImages = (images: string[]) => (
    <Badge
      badgeContent={images.length}
      color="info"
      sx={{
        "& .MuiBadge-badge": {
          zIndex: 1, // Ensures lower priority
        },
      }}
    >
      <ImageIcon color="success" fontSize="small" />
    </Badge>
  );

  return (
    <Card className="p-3 mt-3" onClick={() => logLinkClick(dataset, index)}>
      <div className="flex items-center gap-3">
        <div>
          <h6
            style={{ cursor: "pointer" }}
            className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            {dataset.title}
          </h6>
        </div>
        {dataset.images != null &&
          dataset.images.length > 0 &&
          !panelIsOpen &&
          showImages(dataset?.images)}
      </div>
      {dataset.lastUpdated != null && (
        <span>Last Updated: {dataset.lastUpdated}</span>
      )}
      {dataset.nodes != null &&
        "nodes" in dataset &&
        dataset["nodes"].length > 0 &&
        showNodes(dataset?.nodes)}
    </Card>
  );
}
{
}

export default LaserficheSearchResultCard;
