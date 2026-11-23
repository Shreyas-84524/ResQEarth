import * as React from "react";
import { cn } from "@/lib/utils";

export interface RouteContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg" | "full";
}

export function RouteContainer({
  children,
  size = "default",
  className,
  ...props
}: RouteContainerProps) {
  const sizeClasses = {
    sm: "max-w-4xl",
    default: "max-w-7xl",
    lg: "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
