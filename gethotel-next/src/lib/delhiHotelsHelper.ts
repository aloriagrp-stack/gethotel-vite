import delhiHotelsRaw from "@/data/delhiHotelsLive.json";
import delhiHourlyHotelsRaw from "@/data/delhiHourlyHotels.json";
import type { Hotel } from "@/types";

export const allDelhiHotels = delhiHotelsRaw as unknown as Hotel[];
export const allDelhiHourlyHotels = (delhiHourlyHotelsRaw || []) as unknown as Hotel[];

export function getHotelsByIds(ids: (number | string)[]): Hotel[] {
  const numIds = ids.map((id) => Number(id));
  return allDelhiHotels.filter((h) => numIds.includes(Number(h.id)));
}

export function getHourlyHotelsByIds(ids: (number | string)[]): Hotel[] {
  const numIds = ids.map((id) => Number(id));
  const list = allDelhiHourlyHotels.filter((h) => numIds.includes(Number(h.id)));
  if (list.length > 0) return list;
  // Fallback to general list if needed
  return getHotelsByIds(ids);
}

export const DELHI_LANDING_HOTEL_MAP = {
  hourly: [17, 90, 96, 107, 109, 110, 88, 81, 89, 86, 16, 36, 100, 105, 82, 91],
  airport: [17, 90, 96, 107, 109],
  ndls: [110, 88, 81, 89, 86, 13, 15, 16, 36, 37, 38, 39, 40, 41, 42, 66],
  coupleFriendly: [82, 91, 94, 95, 100, 104, 88, 89, 105, 106, 107, 109, 110, 16],
  karolBagh: [18, 19, 20, 21, 22, 23, 100, 105, 106],
  connaughtPlace: [103, 88, 89, 41, 36, 42],
  southDelhi: [82, 91, 93, 94, 95, 101, 102],
  paharganj: [110, 88, 81, 89, 86, 13, 15, 16, 36, 37, 38, 39, 40, 41, 42, 66],
  gangaRamHospital: [20, 21, 22, 23, 18, 19, 105, 106],
  mahipalpur: [17, 90, 96, 107, 109],
  aiimsHospital: [101, 102, 82, 93, 94, 95],
  earlyCheckIn: [110, 88, 109, 107, 16, 36, 90, 96, 105, 41, 81],
  yashobhoomiDwarka: [85, 90, 96, 107, 109, 17],
  pitampura: [97, 104, 87, 92, 84],
};
