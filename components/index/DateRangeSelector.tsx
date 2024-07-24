import React, { useCallback } from "react";

type DateRangeSelectorProps = {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
};

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = new Date(e.target.value);
      setStartDate(selectedDate.toISOString());
      console.log("Start Date selected:", selectedDate.toISOString());
    },
    [setStartDate]
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = new Date(e.target.value);
      console.log("End Date selected:", selectedDate.toISOString());
      selectedDate.setHours(23, 59, 59, 999);
      setEndDate(selectedDate.toISOString());
    },
    [setEndDate]
  );

  return (
    <div className="flex flex-col items-end w-full">
      <label className="mt-2 flex items-center w-full">
        <span className="text-left w-32">Start Date:</span>
        <input
          type="date"
          value={startDate.split("T")[0]}
          onChange={handleStartDateChange}
          className="p-2 border rounded flex-grow"
        />
      </label>
      <label className="mt-2 flex items-center w-full">
        <span className="text-left w-32">End Date:</span>
        <input
          type="date"
          value={endDate.split("T")[0]}
          onChange={handleEndDateChange}
          className="p-2 border rounded flex-grow "
        />
      </label>
    </div>
  );
};

export default DateRangeSelector;
