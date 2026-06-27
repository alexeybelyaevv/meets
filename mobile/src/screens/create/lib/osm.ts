const osmAmenitySearchTerms: Record<string, string[]> = {
  bar: ["bar", "pub", "biergarten"],
  bars: ["bar", "pub", "biergarten"],
  cafe: ["cafe"],
  cafes: ["cafe"],
  coffee: ["cafe"],
  club: ["nightclub"],
  clubs: ["nightclub"],
  nightclub: ["nightclub"],
  pub: ["pub", "bar"],
  pubs: ["pub", "bar"],
  restaurant: ["restaurant", "fast_food"],
  restaurants: ["restaurant", "fast_food"],
};

export function escapeOverpassRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getOsmAmenityValues(query: string) {
  const normalizedQuery = query.toLowerCase();
  const values = Object.entries(osmAmenitySearchTerms)
    .filter(([term]) => normalizedQuery.includes(term))
    .flatMap(([, amenityValues]) => amenityValues);

  return [...new Set(values)];
}

export function formatOsmAddress(tags: Record<string, string> | undefined) {
  if (!tags) {
    return "";
  }

  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const city = tags["addr:city"];
  const addressLine = [street, houseNumber].filter(Boolean).join(" ");

  return [addressLine, city].filter(Boolean).join(", ");
}
