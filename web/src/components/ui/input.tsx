import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-[10px] border border-input bg-card px-3 text-sm text-ink transition-[color,box-shadow] outline-none placeholder:text-faint",
        "focus-visible:border-brand-line focus-visible:ring-4 focus-visible:ring-brand/10",
        "aria-invalid:border-danger aria-invalid:ring-danger/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
