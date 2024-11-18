import Image from "next/image";
import logo from "/public/logo.jpeg";
import DatasourceSelect from "./DatasourceSelect";
import { USDatasetSource } from "../SearchButton";
import LaserficheLocationBar from "./LaserficheLocationSearchbar";
import DateRangeSelector from "../DateRangeSelector";
import { UserStatus } from "../UserStatus";
import LocationSearchBar from "./LocationSearchBar";
import { useStateContext } from "@/app/StateContext";
import { SearchResults } from "@/app/app/page";

interface Props {
  setPrimary: React.Dispatch<React.SetStateAction<SearchResults[] | null>>;
}

const Sidebar = ({ setPrimary }: Props) => {
  const { state, dispatch } = useStateContext();

  return (
    <div className="col-span-1 white prose flex flex-col h-full border-r border-gray-300">
      <div className="p-2">
        <Image
          src={logo.src}
          alt="Spacious AI"
          width="200"
          height="100"
          className="object-contain w-full mt-5"
        />
      </div>
      <div className="p-2">
        <h4>Specify Data Source</h4>
        <DatasourceSelect />
      </div>

      <div className="p-2 border-t">
        <h4 className="mt-1">Set Location</h4>

        {state.dataSource == "PFAS" ? (
          <LaserficheLocationBar setData={setPrimary} />
        ) : (
          <LocationSearchBar />
        )}
      </div>
      {state.dataSource == "USGS_WATER" && (
        <div className="p-2">
          <h4>Select Date Range</h4>
          <DateRangeSelector
            startDate={state.startDate}
            setStartDate={(newStartDate: string) =>
              dispatch({ type: "updateStartDate", payload: newStartDate })
            }
            endDate={state.endDate}
            setEndDate={(newEndDate: string) =>
              dispatch({ type: "updateEndDate", payload: newEndDate })
            }
          />
        </div>
      )}
      <div className="mt-auto p-4">
        <UserStatus />
      </div>
    </div>
  );
};

export default Sidebar;
