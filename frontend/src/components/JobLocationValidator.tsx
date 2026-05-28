import { useEffect, useRef, useState } from "react";
import { useI18nContext } from "../i18n";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-javascript-api";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type GoogleMapsGeocoderResult = {
  formatted_address: string;
  place_id?: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GoogleMapsApi = {
  maps: {
    Geocoder: new () => {
      geocode: (
        request: { address: string },
        callback: (
          results: GoogleMapsGeocoderResult[] | null,
          status: string
        ) => void
      ) => void;
    };
    Map: new (
      element: HTMLElement,
      options: {
        center: LatLngLiteral;
        zoom: number;
        mapTypeControl: boolean;
        streetViewControl: boolean;
        fullscreenControl: boolean;
      }
    ) => unknown;
    Marker: new (options: {
      position: LatLngLiteral;
      map: unknown;
      title: string;
    }) => unknown;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

export type ValidatedJobLocation = {
  location: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
};

type JobLocationValidatorProps = {
  location: string;
  isValidated: boolean;
  onConfirm: (location: ValidatedJobLocation) => void;
};

let googleMapsScriptPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMapsScript() {
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error("missing-api-key"));
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          if (window.google?.maps) {
            resolve(window.google);
          } else {
            reject(new Error("google-maps-not-loaded"));
          }
        },
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => reject(new Error("google-maps-load-error")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("google-maps-not-loaded"));
      }
    };
    script.onerror = () => reject(new Error("google-maps-load-error"));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

function geocodeLocation(mapsApi: GoogleMapsApi, address: string) {
  return new Promise<ValidatedJobLocation>((resolve, reject) => {
    const geocoder = new mapsApi.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      const result = results?.[0];

      if (status !== "OK" || !result) {
        reject(new Error("location-not-found"));
        return;
      }

      resolve({
        location: result.formatted_address,
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng(),
        placeId: result.place_id ?? null,
      });
    });
  });
}

export default function JobLocationValidator({
  location,
  isValidated,
  onConfirm,
}: JobLocationValidatorProps) {
  const { LL } = useI18nContext();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [mapsApi, setMapsApi] = useState<GoogleMapsApi | null>(null);
  const [pendingLocation, setPendingLocation] =
    useState<ValidatedJobLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen || !mapsApi || !pendingLocation || !mapRef.current) {
      return;
    }

    const center = {
      lat: pendingLocation.latitude,
      lng: pendingLocation.longitude,
    };
    const map = new mapsApi.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    new mapsApi.maps.Marker({
      position: center,
      map,
      title: pendingLocation.location,
    });
  }, [isModalOpen, mapsApi, pendingLocation]);

  async function handleValidateLocation() {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      setStatusMessage(LL.jobLocationValidation.emptyLocation());
      return;
    }

    try {
      setIsValidating(true);
      setStatusMessage("");

      const loadedMapsApi = await loadGoogleMapsScript();
      const foundLocation = await geocodeLocation(
        loadedMapsApi,
        trimmedLocation
      );

      setMapsApi(loadedMapsApi);
      setPendingLocation(foundLocation);
      setIsModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error && error.message === "missing-api-key"
          ? LL.jobLocationValidation.apiKeyMissing()
          : LL.jobLocationValidation.notFound();

      setStatusMessage(message);
    } finally {
      setIsValidating(false);
    }
  }

  function handleConfirmLocation() {
    if (!pendingLocation) {
      return;
    }

    onConfirm(pendingLocation);
    setStatusMessage(LL.jobLocationValidation.validated());
    setIsModalOpen(false);
  }

  return (
    <div className="job-location-validation">
      <div className="job-location-validation-row">
        <button
          type="button"
          className="nav-secondary-button job-location-validate-button"
          onClick={handleValidateLocation}
          disabled={isValidating}
        >
          {isValidating
            ? LL.jobLocationValidation.validating()
            : LL.jobLocationValidation.validateButton()}
        </button>

        {isValidated && (
          <span className="job-location-valid-badge">
            {LL.jobLocationValidation.validated()}
          </span>
        )}
      </div>

      {statusMessage && (
        <p className="job-location-validation-message">{statusMessage}</p>
      )}

      {isModalOpen && pendingLocation && (
        <div className="job-location-modal-backdrop">
          <div
            className="job-location-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-location-modal-title"
          >
            <div className="job-location-modal-header">
              <h2 id="job-location-modal-title">
                {LL.jobLocationValidation.modalTitle()}
              </h2>
              <p>{pendingLocation.location}</p>
            </div>

            <div ref={mapRef} className="job-location-map" />

            <div className="job-location-modal-actions">
              <button
                type="button"
                className="nav-secondary-button"
                onClick={() => setIsModalOpen(false)}
              >
                {LL.jobLocationValidation.close()}
              </button>
              <button
                type="button"
                className="primary-home-button"
                onClick={handleConfirmLocation}
              >
                {LL.jobLocationValidation.confirm()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
