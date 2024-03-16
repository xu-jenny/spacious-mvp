import { IFormInput, parseLocationFormInput } from "@/app/indexUtils";
import { Dispatch, SetStateAction, forwardRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
interface Props {
  setLocations: Dispatch<SetStateAction<string[] | null>>;
}
const LocationInput = ({ setLocations }: Props) => {
  let [locationFormValues, setLocationFormValues] = useState<IFormInput>({
    address: "",
    region: "",
    latitude: 0,
    longitude: 0,
    radius: 0,
    message: "",
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = async (data: IFormInput) => {
    const isSameAsPreviousSubmit = Object.keys(data)
      .filter((fieldName) => fieldName !== "message")
      .every((fieldName) => {
        // @ts-ignore
        return data[fieldName] === locationFormValues[fieldName];
      });

    let interestedLocations = null;
    if (isSameAsPreviousSubmit == false) {
      interestedLocations = await parseLocationFormInput(data);
      setLocationFormValues(data);
      setLocations(interestedLocations);
    }
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
      if (value! < -160 || value! > -68) {
        return "Longitude must be in United States.";
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
      if (value! < 19.5 || value! > 65) {
        return "Longitude must be in United States.";
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
      <div className="flex flex-col p-4">
        <h3>Set Location</h3>
        {/* <span className="text-xs text-slate-500 mb-2">
          Please provide one or more of the following
        </span>
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Latitude"
          {...register("latitude", {
            required: false,
            pattern: /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/,
            validate: { validateLat },
          })}
        />
        {errors?.latitude && (
          <p className="text-red">{errors.latitude.message}</p>
        )}
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Longitude"
          {...register("longitude", {
            required: false,
            pattern:
              /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/,
            validate: { validateLon },
          })}
        />
        <div className="flex flex-col gap-2">
          {errors?.longitude && (
            <p className="text-red">{errors.longitude.message}</p>
          )}
        </div> */}
        <div>
          {/* <label>OR</label> */}
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="City/State/Region"
            {...register("region", {
              required: false,
              validate: { validateRegion },
            })}
          />
          {errors?.region && (
            <p className="text-red">{errors.region.message}</p>
          )}
        </div>
        {/* <hr className="h-px my-4 bg-gray-500 border-0 dark:bg-gray-700"></hr> */}
        {/* <span>Radius of interest</span>
        <div className="p-2">
          <input
            className="mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="number"
            step="0.5"
            placeholder="Miles"
            {...register("radius", { max: 5000, min: 0 })}
          />
        </div> */}
        <button
          type="submit"
          className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
          Confirm
        </button>
      </div>
    </form>
  );
};

export default LocationInput;
