import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "strong" | "outline" | "ghost" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Add framer motion whileTap effect for non-Child buttons to feel premium
    const MotionComp = asChild ? Comp : motion.button

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-action-primary text-text-on-brand hover:bg-action-primary-hover active:bg-action-primary-active shadow-button-primary",
      secondary: "bg-surface-card text-text-primary border border-border-default hover:bg-surface-subtle active:bg-surface-subtle shadow-sm",
      strong: "bg-action-strong text-text-on-dark hover:bg-action-strong-hover shadow-lg text-base",
      outline: "border border-border-default bg-transparent hover:bg-surface-subtle text-text-primary",
      ghost: "hover:bg-surface-subtle hover:text-text-primary text-text-secondary",
      danger: "bg-status-error text-text-on-brand hover:bg-status-error/90 shadow-sm",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <MotionComp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref as any}
        {...(!asChild ? { whileTap: { scale: 0.98 } } : {})}
        {...(props as any)}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
