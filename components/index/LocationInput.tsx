import { IFormInput, parseLocationFormInput } from "@/app/indexUtils";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

const LocationInput = () => {
  let [locationFormValues, setLocationFormValues] = useState<IFormInput>({
    address: "",
    region: "",
    latitude: 0,
    longitude: 0,
    radius: 0,
    message: "",
  });
  let [locations, setLocations] = useState<string[] | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = async (data: IFormInput) => {
    console.log(data);
    // const isSameAsPreviousSubmit = Object.keys(data)
    //   .filter((fieldName) => fieldName !== "message")
    //   .every((fieldName) => {
    //     // @ts-ignore
    //     return data[fieldName] === locationFormValues[fieldName];
    //   });

    // let interestedLocations = null;
    // if (isSameAsPreviousSubmit == false) {
    //   interestedLocations = await parseLocationFormInput(data);
    //   setLocationFormValues(data);
    //   setLocations(interestedLocations);
    // } else {
    //   interestedLocations = locations;
    // }
  };

  const hasRegion = watch("region");

  const validateLon = (value: number | undefined) => {
    if (!hasRegion) {
      if (value == undefined) {
        return "Lat/Lon must not be empty if city/region is empty";
      }
      if (watch("latitude") == undefined) {
        return "Both Lat and Lon need to be filled45";
      }
      if (value! < 113 || value! > 154) {
        return "Longitude must be in Australia.";
      }
      return true;
    }
    return true;
  };

  const validateLat = (value: number | undefined) => {
    if (!hasRegion) {
      if (value == undefined) {
        return "Lat/Lon must not be empty if city/region is empty";
      }
      if (watch("longitude") == undefined) {
        return "Both Lat and Lon need to be filled45";
      }
      if (value! < -44 || value! > -10) {
        return "Longitude must be in Australia.";
      }
      return true;
    }
    return true;
  };

  const validateRegion = (value: string | undefined) => {
    const hasLatitude = watch("latitude");
    const hasLongitude = watch("longitude");

    // if (!value && (!hasLatitude || !hasLongitude)) {
    //   return "City/Region must be filled if Latitude and Longitude are not filled.";
    // }
    if (value && (hasLatitude || hasLongitude)) {
      return "City/Region must not be filled if Latitude, and Longitude are filled.";
    }

    return true;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mt-4 mx-4">Interested Location </h2>
      <div className="grid gap-6 mb-6 md:grid-cols-2 px-4 mt-2">
        <input
          placeholder="Latitude"
          {...register("latitude", {
            required: false,
            pattern: /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/,
            validate: { validateLat },
          })}
        />
        {errors?.latitude && <p>{errors.latitude.message}</p>}
        <input
          placeholder="Longitude"
          {...register("longitude", {
            required: false,
            pattern:
              /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/,
            validate: { validateLon },
          })}
        />
        {errors?.longitude && <p>{errors.longitude.message}</p>}
        <input
          placeholder="City/State"
          {...register("region", {
            required: false,
            validate: { validateRegion },
          })}
        />
        {errors?.region && <p>{errors.region.message}</p>}
        <input
          type="number"
          step="0.5"
          placeholder="Radius of interest in km"
          {...register("radius", { max: 5000, min: 0 })}
        />
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default LocationInput;
