"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, AlertCircle } from "lucide-react";
import { DisasterCard } from "./disaster-card";
import { DisasterQuickEmergencyCta } from "./disaster-quick-emergency-cta";
import { EmptyState } from "@/components/ui/empty-state";
import type { DisasterGuide, DisasterKnowledgeCategory } from "../../types/knowledge";
import { searchDisasterGuides } from "../../services/knowledge-service";

interface DisasterPortalClientProps {
  initialGuides: DisasterGuide[];
}

export function DisasterPortalClient({ initialGuides }: DisasterPortalClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<DisasterKnowledgeCategory | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredGuides = React.useMemo(() => {
    return searchDisasterGuides({
      category: selectedCategory,
      searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  const naturalCount = initialGuides.filter((g) => g.category === "natural").length;
  const manMadeCount = initialGuides.filter((g) => g.category === "man-made").length;

  return (
    <div className="space-y-6">
      {/* Quick Emergency Numbers Header */}
      <DisasterQuickEmergencyCta />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <Tabs
          value={selectedCategory}
          onValueChange={(val: string) => setSelectedCategory(val as DisasterKnowledgeCategory | "all")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all" className="text-xs">
              All ({initialGuides.length})
            </TabsTrigger>
            <TabsTrigger value="natural" className="text-xs">
              Natural ({naturalCount})
            </TabsTrigger>
            <TabsTrigger value="man-made" className="text-xs">
              Man-Made ({manMadeCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hazards, causes, signs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Disasters Grid */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuides.map((guide) => (
            <DisasterCard key={guide.slug} guide={guide} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="No Matching Disaster Guides"
          description={`No hazard guides found matching "${searchQuery}" in ${
            selectedCategory === "all" ? "any" : selectedCategory
          } categories.`}
        />
      )}
    </div>
  );
}
