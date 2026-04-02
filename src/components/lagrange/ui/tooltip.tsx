import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
));
TooltipProvider.displayName = "TooltipProvider";

export { TooltipProvider };