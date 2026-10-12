/**
 * Optional Google Maps integration (Places API (New) autocomplete + Routes API), called from the
 * browser with a key restricted by HTTP referrer to the site's domain. Nothing is requested
 * until a visitor types an address. Without a key the calculator asks for kilometres instead.
 */
import { site } from "@/config/site";

export type Suggestion = { placeId: string; text: string };

export const mapsEnabled = () => Boolean(site.mapsKey);

const cache = new Map<string, Suggestion[]>();
let warmed = false;
/** Opens the TLS connection to Google early (on field focus), so the first suggestion is faster. */
export function warmUp() {
  if (warmed || !site.mapsKey) return;
  warmed = true;
  for (const href of ["https://places.googleapis.com", "https://routes.googleapis.com"]) {
    const l = document.createElement("link");
    l.rel = "preconnect"; l.href = href; l.crossOrigin = "anonymous";
    document.head.appendChild(l);
  }
}

export async function autocomplete(input: string, sessionToken: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const key = input.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": site.mapsKey },
    // Bias towards the service area (Chiajna / Militari, 60 km radius) so local results come first.
    body: JSON.stringify({ input, sessionToken, languageCode: "ro", includedRegionCodes: ["ro"], locationBias: { circle: { center: { latitude: 44.4428, longitude: 25.9786 }, radius: 50000 } } }),
  });
  if (!res.ok) throw new Error(`places_${res.status}`);
  const data = (await res.json()) as { suggestions?: { placePrediction?: { placeId: string; text: { text: string } } }[] };
  const out = (data.suggestions ?? []).flatMap((s) => (s.placePrediction ? [{ placeId: s.placePrediction.placeId, text: s.placePrediction.text.text }] : []));
  cache.set(key, out);
  return out;
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
