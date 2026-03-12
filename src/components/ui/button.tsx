import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Add framer motion whileTap effect for non-Child buttons to feel premium
    const MotionComp = asChild ? Comp : motion.button

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
      outline: "border border-border bg-transparent hover:bg-muted text-foreground",
      ghost: "hover:bg-muted hover:text-foreground text-muted-foreground",
      secondary: "bg-muted text-foreground hover:bg-muted/80",
      danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
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
