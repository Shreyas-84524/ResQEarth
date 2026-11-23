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
        "mx-auto w-full px-5 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
