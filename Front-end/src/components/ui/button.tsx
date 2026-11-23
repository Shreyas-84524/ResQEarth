import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
        brand: "bg-primary text-white shadow-sm hover:bg-teal-800",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50",
        secondary:
          "bg-slate-100 text-slate-800 border border-transparent hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-950",
        link: "text-primary underline-offset-4 hover:underline rounded-none p-0 h-auto",
        success: "bg-primary text-white shadow-sm hover:bg-teal-800",
        warning: "bg-warning text-warning-foreground shadow hover:bg-warning/90 hover:-translate-y-0.5",
        "risk-critical":
          "bg-risk-critical text-white shadow hover:bg-risk-critical/90 hover:-translate-y-0.5",
        "risk-high": "bg-risk-high text-white shadow hover:bg-risk-high/90 hover:-translate-y-0.5",
        "risk-moderate":
          "bg-risk-moderate text-slate-900 shadow hover:bg-risk-moderate/90 hover:-translate-y-0.5",
        "risk-guarded": "bg-risk-guarded text-white shadow hover:bg-risk-guarded/90 hover:-translate-y-0.5",
        "risk-low": "bg-[#0B8F2F] text-white shadow hover:bg-[#08752A] hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
      return React.cloneElement(child, {
        className: cn(
          buttonVariants({ variant, size, className }),
          child.props?.className
        ),
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
