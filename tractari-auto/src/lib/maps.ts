/**
 * Optional Google Maps integration (Places API (New) autocomplete + Routes API), called from the
 * browser with a key restricted by HTTP referrer to the site's domain. Nothing is requested
 * until a visitor types an address. Without a key the calculator asks for kilometres instead.
 */
import { site } from "@/config/site";

export type Suggestion = { placeId: string; text: string };

export const mapsEnabled = () => Boolean(site.mapsKey);

export async function autocomplete(input: string, sessionToken: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": site.mapsKey },
    body: JSON.stringify({ input, sessionToken, languageCode: "ro", includedRegionCodes: ["ro"] }),
  });
  if (!res.ok) throw new Error(`places_${res.status}`);
  const data = (await res.json()) as { suggestions?: { placePrediction?: { placeId: string; text: { text: string } } }[] };
  return (data.suggestions ?? []).flatMap((s) => (s.placePrediction ? [{ placeId: s.placePrediction.placeId, text: s.placePrediction.text.text }] : []));
}

export async function route(originPlaceId: string, destinationPlaceId: string, signal?: AbortSignal) {
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": site.mapsKey, "X-Goog-FieldMask": "routes.distanceMeters,routes.duration" },
    body: JSON.stringify({ origin: { placeId: originPlaceId }, destination: { placeId: destinationPlaceId }, travelMode: "DRIVE", languageCode: "ro", units: "METRIC" }),
  });
  if (!res.ok) throw new Error(`routes_${res.status}`);
  const data = (await res.json()) as { routes?: { distanceMeters?: number; duration?: string }[] };
  const r = data.routes?.[0];
  if (!r?.distanceMeters) throw new Error("no_route");
  return { km: r.distanceMeters / 1000, hours: r.duration ? parseFloat(r.duration) / 3600 : undefined };
}
