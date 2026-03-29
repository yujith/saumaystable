"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";

export interface PlaceResult {
  street: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  defaultValue?: string;
}

let optionsSet = false;
let loadPromise: Promise<google.maps.PlacesLibrary> | null = null;

async function ensurePlacesLoaded(): Promise<google.maps.PlacesLibrary> {
  if (loadPromise) return loadPromise;

  const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");

  if (!optionsSet) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      v: "weekly",
      libraries: ["places"],
    });
    optionsSet = true;
  }

  loadPromise = importLibrary("places");
  return loadPromise;
}

export function AddressAutocomplete({
  onPlaceSelect,
  onChange,
  placeholder = "Start typing your address...",
  label,
  disabled,
  defaultValue = "",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);
  onPlaceSelectRef.current = onPlaceSelect;
  onChangeRef.current = onChange;

  // Load the Places library (SSR-safe — dynamic import)
  useEffect(() => {
    let mounted = true;

    ensurePlacesLoaded()
      .then(() => {
        if (mounted) {
          setIsLoaded(true);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error("Google Maps loader error:", err);
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize autocomplete when loaded and input is ready
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    if (autocompleteRef.current) return; // already initialized

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "lk" },
      fields: ["address_components", "geometry", "formatted_address", "name"],
      types: ["address"],
    });

    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.address_components) {
        return;
      }

      const components: Record<string, string> = {};
      place.address_components.forEach((component) => {
        const type = component.types[0];
        components[type] = component.long_name;
      });

      const streetNumber = components["street_number"] || "";
      const route = components["route"] || "";
      const subLocality = components["sublocality"] || components["sublocality_level_1"] || "";
      const premise = components["premise"] || "";

      let street = "";
      if (premise) {
        street = premise;
      } else if (streetNumber && route) {
        street = `${streetNumber} ${route}`;
      } else if (route) {
        street = route;
      } else if (subLocality) {
        street = subLocality;
      }

      if (subLocality && !street.includes(subLocality)) {
        street = street ? `${street}, ${subLocality}` : subLocality;
      }

      const city = components["locality"] || components["administrative_area_level_2"] || "";
      const district = components["administrative_area_level_1"] || "";
      const lat = place.geometry.location?.lat() || 0;
      const lng = place.geometry.location?.lng() || 0;
      const fullAddress = place.formatted_address || "";

      onChangeRef.current?.(fullAddress);
      onPlaceSelectRef.current({
        street: street || fullAddress.split(",")[0] || "",
        city,
        district,
        lat,
        lng,
        fullAddress,
      });
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded]);

  const handleManualChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeRef.current?.(e.target.value);
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="font-headline font-semibold text-xs text-secondary uppercase tracking-widest">
          {label}
        </Label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          onChange={handleManualChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          autoComplete="off"
          className="flex h-10 w-full rounded-lg bg-surface-container border-none p-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all pr-10 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {isLoaded && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-secondary text-lg">location_on</span>
          </div>
        )}
      </div>
      {!isLoaded && !isLoading && (
        <p className="text-xs text-error font-label">
          Could not load address search. Please type your address manually.
        </p>
      )}
    </div>
  );
}
