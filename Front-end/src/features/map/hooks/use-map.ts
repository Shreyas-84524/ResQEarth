"use client";

import * as React from "react";
import { MapContext } from "../context/map-context";
import type { MapContextValue } from "../types/map";

/**
 * Custom hook to access MapLibre map context and state
 */
export function useMap(): MapContextValue {
  const context = React.useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a <MapProvider>");
  }
  return context;
}
