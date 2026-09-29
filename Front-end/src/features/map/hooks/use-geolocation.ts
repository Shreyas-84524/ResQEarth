"use client";

import * as React from "react";
import { LocationContext } from "../context/location-context";
import type { LocationContextValue } from "../types/geolocation";

/**
 * Custom hook to access normalized user location, permission state, and geolocation actions
 */
export function useGeolocation(): LocationContextValue {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error("useGeolocation must be used within a <LocationProvider>");
  }
  return context;
}
