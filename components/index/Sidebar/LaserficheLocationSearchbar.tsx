import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from "@mui/material";
import { laserficheFilter } from "@/app/search/search";
import { SearchResults } from "@/app/app/page";
import { useStateContext } from "@/app/StateContext";
import { useAuthStateContext } from "@/components/AuthStateContext";

export type LaserficheSearchType = "all" | "filter-image";

const LaserficheLocationBar = () => {
  const [searchType, setSearchType] = useState<LaserficheSearchType>("all");
  const { role } = useAuthStateContext();
  const { dispatch } = useStateContext();
  const options = [
    "NCS000050",
    "NCG080886",
    "NCG240012",
    // "WI0500447",
    "NCG060230",
    // "01005-97-032"
    "NCD065300519",
  ];
  const [value, setValue] = React.useState<string | null>("");
  const [inputValue, setInputValue] = React.useState("");
  const [showFilters, setShowFilters] = React.useState<Boolean>(false);

  const handleLocationInputChange = async (newLoc: string) => {
    setInputValue(newLoc);
    let results = await laserficheFilter(newLoc, role, false);
    dispatch({
      type: "updateSearchResults",
      payload: results,
    });
    setShowFilters(true);
  };

  const handleSearchtypeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.name === "filter-image" && event.target.checked) {
      setSearchType("filter-image");
      let results = await laserficheFilter(inputValue, role, true);
      if (results != undefined) {
        dispatch({
          type: "updateSearchResults",
          payload: results,
        });
      }
    } else if (searchType != "all") {
      setSearchType("all");
      let results = await laserficheFilter(inputValue, role, false);
      dispatch({
        type: "updateSearchResults",
        payload: results,
      });
    }
  };

  const handleExportSiteImages = async () => {
    console.log("handle Export site Images for ", inputValue);
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche-site-images`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? "",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ location: inputValue, role: role }),
      }
    )
      .then((response) => response.blob())
      .catch((error) => {
        console.error(error);
      });

    if (response) {
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "images.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <Autocomplete
        className="w-full"
        value={value}
        onChange={(event: any, newValue: string | null) => {
          setValue(newValue);
          if (newValue != null) {
            dispatch({
              type: "updateLocation",
              payload: {
                lat: 0.0,
                lon: 0.0,
                name: newValue,
                display_name: newValue,
                addresstype: "string",
              },
            });
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          handleLocationInputChange(newInputValue);
        }}
        id="location-bar"
        options={options}
        renderInput={(params) => <TextField {...params} />}
      />
      {showFilters && (
        <>
          <div className="ml-2">
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={searchType == "filter-image"}
                      onChange={handleSearchtypeChange}
                      name="filter-image"
                    />
                  }
                  label="Contain Image"
                />
              </FormGroup>
            </FormControl>
          </div>
          <Button
            onClick={() => handleExportSiteImages()}
            className="ml-auto mr-auto"
          >
            Export Site Images
          </Button>
        </>
      )}
    </div>
  );
};

export default LaserficheLocationBar;
