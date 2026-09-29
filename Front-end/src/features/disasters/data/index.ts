import { NATURAL_DISASTER_GUIDES } from "./natural-disasters";
import { MAN_MADE_DISASTER_GUIDES } from "./man-made-disasters";
import type { DisasterGuide } from "../types/knowledge";

export * from "./natural-disasters";
export * from "./man-made-disasters";

export const ALL_DISASTER_GUIDES: DisasterGuide[] = [
  ...NATURAL_DISASTER_GUIDES,
  ...MAN_MADE_DISASTER_GUIDES,
];
