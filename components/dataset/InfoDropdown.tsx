"use client";
import { Dataset } from "@/app/dataset/[id]/util";
import { ReactNode, useState } from "react";
import { Dropdown } from "flowbite-react";

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
    if (info == null) return <></>;
    info = info.replace("<class 'pandas.core.frame.DataFrame'>\n", "");
    info = info.replace("RangeIndex:", "Number of rows:");
    return <pre>{info}</pre>;
  };

  const renderCorr = (corr: string | null) => {
    if (corr == null) return <></>;
    const c = JSON.parse(corr);
    let corrStr = "Highly correlated columns:\n";
    Object.entries(c).forEach(
      (pair) =>
        (corrStr +=
          pair[0] +
          ": " +
          Math.round(parseFloat(pair[1] as string) * 100) / 100 +
          "\n")
    );
    return <pre>{corrStr}</pre>;
  };

  const selectedInfo = (): ReactNode => {
    switch (selected) {
      case "df.info":
        return renderInfo(dataset["df.info"]);
      case "corr":
        return renderCorr(dataset["corr"]);
      default:
        // @ts-ignore
        return <pre>{dataset[selected]}</pre>;
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-row justify-between h-6 w-full items-center">
        <span className="font-semibold text-md">Information About Dataset</span>
        <Dropdown label={selected} dismissOnClick={false} className="h-fit ">
          {availableOptions.map((option) => (
            <li
              onClick={() => setSelected(option)}
              key={option}
              role="menuitem"
              className="mr-6 py-2 list-none hover:bg-gray-100 focus:bg-gray-100 cursor-pointer w-full"
            >
              {option}
            </li>
          ))}
        </Dropdown>
      </div>
      <div className="mt-2">{selectedInfo()}</div>
    </div>
  );
};
