import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input bg-background hover:bg-accent/5",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                ghost: "bg-transparent hover:bg-accent/10 text-foreground",
            },
            size: {
                default: "h-11 px-4 py-2",
                sm: "h-9 px-3 rounded-md",
                lg: "h-12 px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
    />
))
Button.displayName = "Button"

export { Button, buttonVariants }
