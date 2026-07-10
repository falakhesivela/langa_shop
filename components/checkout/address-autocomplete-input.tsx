"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/Input";
import {
  isPlacesEnabled,
  loadPlacesLibrary,
} from "@/lib/places/load-places";
import {
  parsePlaceAddressComponents,
  type ParsedPlaceAddress,
} from "@/lib/places/parse-address";

type AddressAutocompleteInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (address: ParsedPlaceAddress) => void;
  required?: boolean;
  placeholder?: string;
};

type SuggestionItem = {
  key: string;
  label: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
};

/**
 * Street-address field using Places API (New) AutocompleteSuggestion data API
 * with our shared Input, so styling matches the rest of the checkout form.
 */
export function AddressAutocompleteInput({
  id = "address1",
  value,
  onChange,
  onPlaceSelect,
  required,
  placeholder = "Start typing your street address…",
}: AddressAutocompleteInputProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [placesReady, setPlacesReady] = useState(false);
  const placesEnabled = isPlacesEnabled();

  useEffect(() => {
    if (!placesEnabled) return;
    let cancelled = false;
    void loadPlacesLibrary()
      .then(({ AutocompleteSessionToken }) => {
        if (cancelled) return;
        sessionTokenRef.current = new AutocompleteSessionToken();
        setPlacesReady(true);
      })
      .catch(() => {
        if (!cancelled) setPlacesReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [placesEnabled]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const fetchSuggestions = useEffectEvent(async (input: string) => {
    if (!placesReady || input.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const requestId = ++requestIdRef.current;
    try {
      const { AutocompleteSuggestion } = await loadPlacesLibrary();
      if (!sessionTokenRef.current) {
        const { AutocompleteSessionToken } = await loadPlacesLibrary();
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      const { suggestions: results } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          includedRegionCodes: ["za"],
          includedPrimaryTypes: ["street_address"],
          region: "za",
          language: "en",
          sessionToken: sessionTokenRef.current ?? undefined,
        });

      if (requestId !== requestIdRef.current) return;

      const items: SuggestionItem[] = results
        .map((suggestion, index) => {
          const prediction = suggestion.placePrediction;
          if (!prediction) return null;
          return {
            key: prediction.placeId || `${prediction.text.toString()}-${index}`,
            label: prediction.text.toString(),
            mainText: prediction.mainText?.toString() ?? prediction.text.toString(),
            secondaryText: prediction.secondaryText?.toString() ?? "",
            prediction,
          };
        })
        .filter((item): item is SuggestionItem => item !== null);

      setSuggestions(items);
      setOpen(items.length > 0);
      setActiveIndex(items.length > 0 ? 0 : -1);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
    }
  });

  useEffect(() => {
    if (!placesReady) return;
    const handle = window.setTimeout(() => {
      void fetchSuggestions(value);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [value, placesReady]);

  async function selectSuggestion(item: SuggestionItem) {
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);

    try {
      const place = item.prediction.toPlace();
      await place.fetchFields({
        fields: ["addressComponents", "formattedAddress"],
      });

      const parsed = parsePlaceAddressComponents(
        place.addressComponents ?? [],
        place.formattedAddress ?? item.label,
      );

      onChange(parsed.address1);
      onPlaceSelect(parsed);

      // End the billing session and start a fresh token for the next search.
      const { AutocompleteSessionToken } = await loadPlacesLibrary();
      sessionTokenRef.current = new AutocompleteSessionToken();
    } catch {
      onChange(item.mainText || item.label);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showAutocomplete = placesEnabled && placesReady;

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (showAutocomplete) setOpen(true);
        }}
        onFocus={() => {
          if (showAutocomplete && suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={showAutocomplete ? placeholder : undefined}
        required={required}
        autoComplete="street-address"
        role={showAutocomplete ? "combobox" : undefined}
        aria-autocomplete={showAutocomplete ? "list" : undefined}
        aria-expanded={showAutocomplete ? open : undefined}
        aria-controls={showAutocomplete && open ? listboxId : undefined}
        aria-activedescendant={
          showAutocomplete && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
      />

      {showAutocomplete && open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-border bg-background py-1 text-sm shadow-none"
        >
          {suggestions.map((item, index) => {
            const active = index === activeIndex;
            return (
              <li key={item.key} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={active}
                  className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    // Keep focus on the input; select on mouseup/click.
                    event.preventDefault();
                  }}
                  onClick={() => void selectSuggestion(item)}
                >
                  <span className="font-medium">{item.mainText}</span>
                  {item.secondaryText ? (
                    <span className="text-muted-foreground">
                      {item.secondaryText}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
