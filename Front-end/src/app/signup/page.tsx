import type { Metadata } from "next";
import { RouteContainer } from "@/components/layout/route-container";
import { SignupForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create Citizen Account | ResQEarth",
  description:
    "Register for a ResQEarth citizen account to receive local disaster intelligence, explainable risk calculations, and emergency alerts.",
};

export default function SignupPage() {
  return (
    <RouteContainer size="sm">
      <div className="mx-auto max-w-md py-6 sm:py-10">
        <SignupForm />
      </div>
    </RouteContainer>
  );
}
