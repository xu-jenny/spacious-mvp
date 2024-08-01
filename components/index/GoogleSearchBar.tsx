import React, { useEffect, useRef } from "react";

type Props = {
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
  value?: string;
};

const GoogleSearchBar: React.FC<Props> = ({
  placeholder,
  value,
  onChange,
  className,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadScript = (url: string, callback: () => void) => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.onload = callback;
      document.head.appendChild(script);
    };

    const options = {
      componentRestrictions: { country: "us" },
    };

    const initializeAutocomplete = () => {
      if (!inputRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.error("Returned place contains no geometry");
          return;
        }

        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    };
    if (!window.google) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`,
        initializeAutocomplete
      );
    } else {
      initializeAutocomplete();
    }
  }, [onChange]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        className={
          className == null
            ? "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            : className
        }
        value={value}
        placeholder={placeholder || "Enter a location"}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default GoogleSearchBar;
