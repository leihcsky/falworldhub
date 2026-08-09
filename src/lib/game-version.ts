import meta from "../../data/meta.json";

export type GameDataMeta = {
  gameVersion: string;
  gameVersionLabel: string;
  isLatest: boolean;
  dataUpdatedAt: string;
};

export function getGameDataMeta(): GameDataMeta {
  return meta as GameDataMeta;
}

/** YYYY-MM-DD → compact display date */
export function formatDataUpdatedAt(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
