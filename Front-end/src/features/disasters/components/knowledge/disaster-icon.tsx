import * as React from "react";
import {
  Waves,
  Wind,
  Activity,
  Mountain,
  SunMedium,
  Biohazard,
  Flame,
  CloudLightning,
  Snowflake,
  Droplets,
  CloudRain,
  Building,
  Factory,
  Radiation,
  Skull,
  Ship,
  Car,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Waves,
  Wind,
  Activity,
  Mountain,
  SunMedium,
  Biohazard,
  Flame,
  CloudLightning,
  Snowflake,
  Droplets,
  CloudRain,
  Building,
  Factory,
  Radiation,
  Skull,
  Ship,
  Car,
  AlertTriangle,
};

interface DisasterIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export function DisasterIcon({ name, className = "h-5 w-5", ...props }: DisasterIconProps) {
  const IconComponent = ICON_MAP[name] || AlertTriangle;
  return <IconComponent className={className} {...props} />;
}
