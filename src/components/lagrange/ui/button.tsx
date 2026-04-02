import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-gray-900 text-white hover:bg-gray-800",
  destructive:
    "bg-red-600 text-white hover:bg-red-700",
  outline:
    "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-100/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    
    const sizeClasses = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10",
    };
    
    const variantClasses = buttonVariants[variant];
    
    return (
      <button
        ref={ref}
        className={cn(baseClasses, sizeClasses[size], variantClasses, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };