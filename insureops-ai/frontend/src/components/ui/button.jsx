import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:-translate-y-0.5",
                secondary:
                    "bg-white/[0.03] border border-white/20 text-[#f1ebe4] hover:bg-white/[0.08]",
                outline:
                    "border border-white/15 bg-transparent text-[#f1ebe4] hover:bg-white/[0.05]",
                ghost:
                    "text-[#a89888] hover:text-[#f1ebe4] hover:bg-white/[0.04]",
                link:
                    "text-orange-400 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-8 py-3",
                sm: "h-9 px-4 py-2 text-xs",
                lg: "h-14 px-10 py-5 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
