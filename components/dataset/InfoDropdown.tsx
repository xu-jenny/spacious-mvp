"use client";
import { Dataset } from "@/app/dataset/[id]/util";
import { useState } from "react";
import Dropdown from "../common/Dropdown";

export const InfoDropdown = ({ dataset }: { dataset: Dataset }) => {
  let [selected, setSelected] = useState<string>("df.desc");

  const availableOptions: string[] = [
    "df.info",
    "df.value_counts",
    "df.nunique",
    "corr",
    "df.desc",
  ]
    .map((option) => (option in dataset ? option : null))
    .flatMap((f) => (f ? [f] : []));

  const renderInfo = (info: string | null) => {
    if (info == null) return null;
    info = info.replace("<class 'pandas.core.frame.DataFrame'>\n", "");
    info = info.replace("RangeIndex:", "Number of rows:");
    return <pre>{info}</pre>;
  };

  const selectedInfo = () => {
    switch (selected) {
      case "df.info":
        return renderInfo(dataset["df.info"]);
      default:
        // @ts-ignore
        return <pre>{dataset[selected]}</pre>;
    }
  };

  return (
    <div>
      <Dropdown
        name={selected}
        options={availableOptions}
        onSelect={setSelected}
      />
      <div></div>
    </div>
  );
};
