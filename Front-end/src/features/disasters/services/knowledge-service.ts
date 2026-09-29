import { ALL_DISASTER_GUIDES, NATURAL_DISASTER_GUIDES, MAN_MADE_DISASTER_GUIDES } from "../data";
import type {
  DisasterGuide,
  DisasterKnowledgeCategory,
  DisasterGuideFilterOptions,
} from "../types/knowledge";

/**
 * Retrieve all registered disaster preparedness guides (Natural and Man-Made).
 */
export function getAllDisasterGuides(): DisasterGuide[] {
  return ALL_DISASTER_GUIDES;
}

/**
 * Retrieve a specific disaster guide by its URL slug.
 */
export function getDisasterGuideBySlug(slug: string): DisasterGuide | undefined {
  if (!slug) return undefined;
  const normalizedSlug = slug.trim().toLowerCase();
  return ALL_DISASTER_GUIDES.find((guide) => guide.slug.toLowerCase() === normalizedSlug);
}

/**
 * Retrieve all disaster guides filtered by category ('natural' or 'man-made').
 */
export function getDisasterGuidesByCategory(
  category: DisasterKnowledgeCategory
): DisasterGuide[] {
  if (category === "natural") return NATURAL_DISASTER_GUIDES;
  if (category === "man-made") return MAN_MADE_DISASTER_GUIDES;
  return ALL_DISASTER_GUIDES;
}

/**
 * Search and filter disaster guides by category and text search query.
 */
export function searchDisasterGuides(options: DisasterGuideFilterOptions = {}): DisasterGuide[] {
  const { category = "all", searchQuery = "" } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  let guides = ALL_DISASTER_GUIDES;
  if (category !== "all") {
    guides = guides.filter((g) => g.category === category);
  }

  if (!normalizedQuery) {
    return guides;
  }

  return guides.filter((guide) => {
    const inTitle = guide.title.toLowerCase().includes(normalizedQuery);
    const inDesc = guide.shortDescription.toLowerCase().includes(normalizedQuery);
    const inDef = guide.definition.toLowerCase().includes(normalizedQuery);
    const inCauses = guide.causes.some((c) => c.toLowerCase().includes(normalizedQuery));
    const inSigns = guide.warningSigns.some((s) => s.toLowerCase().includes(normalizedQuery));

    return inTitle || inDesc || inDef || inCauses || inSigns;
  });
}

/**
 * Get all available disaster guide slugs (useful for generateStaticParams).
 */
export function getAllDisasterSlugs(): string[] {
  return ALL_DISASTER_GUIDES.map((g) => g.slug);
}

/**
 * Retrieve related disaster guides within the same category.
 */
export function getRelatedDisasters(currentSlug: string, limit = 3): DisasterGuide[] {
  const current = getDisasterGuideBySlug(currentSlug);
  if (!current) return [];

  return ALL_DISASTER_GUIDES.filter(
    (g) => g.slug !== current.slug && g.category === current.category
  ).slice(0, limit);
}
