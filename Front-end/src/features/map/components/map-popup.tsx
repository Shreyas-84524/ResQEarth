import type { MapPopupData } from "../types/map";
import { SEVERITY_COLORS } from "../constants/map-layers";

/**
 * Generates an accessible, styled HTML string for MapLibre popup DOM injection
 */
export function generatePopupHtml(data: MapPopupData): string {
  const severityColor = SEVERITY_COLORS[data.severity] || "#f59e0b";
  const [lng, lat] = data.coordinates;

  const provenanceBadge =
    data.provenance === "official"
      ? `<span style="background-color: #4f46e5; color: #ffffff; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase;">Official Alert</span>`
      : data.provenance === "calculated"
      ? `<span style="background-color: #0d9488; color: #ffffff; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase;">Calculated Risk</span>`
      : `<span style="background-color: #9333ea; color: #ffffff; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase;">Simulation</span>`;

  const guideLink = data.guideSlug
    ? `<a href="/disasters/${data.guideSlug}" style="display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 600; color: #2563eb; text-decoration: underline;">View Safety Protocol &rarr;</a>`
    : "";

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 200px; max-width: 260px; color: #0f172a; line-height: 1.4;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
        <span style="background-color: ${severityColor}; color: #ffffff; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${data.severity}</span>
        ${provenanceBadge}
      </div>
      <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${data.title}</h4>
      ${data.description ? `<p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">${data.description}</p>` : ""}
      <div style="font-size: 10px; color: #64748b; font-family: monospace; border-top: 1px solid #e2e8f0; padding-top: 4px;">
        Coords: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
      </div>
      ${data.sourceName ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Source: ${data.sourceName}</div>` : ""}
      ${guideLink}
    </div>
  `;
}
