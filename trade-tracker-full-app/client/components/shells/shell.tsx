import * as React from "react";

import { cn } from "@/lib/utils";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Shell({
  children,
  className,
  as: Comp = "div",
  ...props
}: ShellProps) {
  return (
    <Comp
      className={cn("container grid gap-8 pb-8 pt-6 md:py-8", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
