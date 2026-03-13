import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-subtle text-text-secondary border-transparent",
    primary: "bg-action-primary/10 text-action-primary border-transparent",
    outline: "text-text-primary border-border-default",
    danger: "bg-status-error/10 text-status-error border-transparent",
    success: "bg-status-success/10 text-status-success border-transparent",
    warning: "bg-status-warning/10 text-status-warning border-transparent",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus",
        variants[variant === "secondary" ? "default" : variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
