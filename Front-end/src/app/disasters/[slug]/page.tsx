import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteContainer } from "@/components/layout/route-container";
import {
  getAllDisasterSlugs,
  getDisasterGuideBySlug,
  getRelatedDisasters,
} from "@/features/disasters/services/knowledge-service";
import { DisasterGuideView } from "@/features/disasters/components/knowledge/disaster-guide-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllDisasterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getDisasterGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Disaster Guide Not Found | ResQEarth",
    };
  }

  return {
    title: `${guide.title} Preparedness & Safety Guide | ResQEarth`,
    description: guide.shortDescription,
    openGraph: {
      title: `${guide.title} Safety Manual & Emergency SOPs`,
      description: guide.bannerDescription,
      type: "article",
    },
  };
}

export default async function DisasterDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getDisasterGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = getRelatedDisasters(guide.slug, 3);

  return (
    <RouteContainer size="lg">
      <DisasterGuideView guide={guide} relatedGuides={relatedGuides} />
    </RouteContainer>
  );
}
