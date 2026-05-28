import type { CSSProperties } from "react";

type LocationMapLinkProps = {
  location: string | null;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  fallback: string;
  className?: string;
  style?: CSSProperties;
};

function getGoogleMapsUrl({
  location,
  latitude,
  longitude,
  placeId,
}: Pick<
  LocationMapLinkProps,
  "location" | "latitude" | "longitude" | "placeId"
>) {
  const trimmedLocation = location?.trim();
  const params = new URLSearchParams({ api: "1" });

  if (placeId && trimmedLocation) {
    params.set("query", trimmedLocation);
    params.set("query_place_id", placeId);
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  if (typeof latitude === "number" && typeof longitude === "number") {
    params.set("query", `${latitude},${longitude}`);
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  if (trimmedLocation) {
    params.set("query", trimmedLocation);
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  return null;
}

export default function LocationMapLink({
  location,
  latitude,
  longitude,
  placeId,
  fallback,
  className,
  style,
}: LocationMapLinkProps) {
  const mapsUrl = getGoogleMapsUrl({
    location,
    latitude,
    longitude,
    placeId,
  });

  if (!mapsUrl) {
    return (
      <span className={className} style={style}>
        {fallback}
      </span>
    );
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      className={className}
      style={style}
      title={location ?? fallback}
    >
      {location}
    </a>
  );
}
