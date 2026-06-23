export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

export const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value);

export const clamp = (min: number, max: number) => (value: number): number =>
  Math.min(Math.max(value, min), max);

export const toFixedNumber = (decimals: number) => (value: number): number =>
  Number(value.toFixed(decimals));

export const calculateAverage = (scores: readonly number[]): number =>
  scores.length === 0 ? 0 : scores.reduce((sum, s) => sum + s, 0) / scores.length;

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} Min`;
  return `${hours} Std ${minutes} Min`;
};

export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const isWithinSwitzerland = (lat: number, lng: number): boolean =>
  lat >= 45.8 && lat <= 47.9 && lng >= 5.9 && lng <= 10.5;

export const groupBy = <T>(items: readonly T[], keyFn: (item: T) => string): Record<string, T[]> =>
  items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    return { ...groups, [key]: [...(groups[key] ?? []), item] };
  }, {});

export const sortBy = <T>(items: readonly T[], keyFn: (item: T) => number, desc = false): T[] =>
  [...items].sort((a, b) => (desc ? keyFn(b) - keyFn(a) : keyFn(a) - keyFn(b)));

export const uniqueBy = <T>(items: readonly T[], keyFn: (item: T) => string): T[] =>
  items.filter(
    (item, index, arr) => arr.findIndex((other) => keyFn(other) === keyFn(item)) === index
  );

export const safeParseJSON = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};
