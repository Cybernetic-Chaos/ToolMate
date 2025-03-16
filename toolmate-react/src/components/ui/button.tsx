import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        orangeGradient:
          "flex items-center justify-center gap-2 bg-gradient-to-tr from-orange to-lightOrange p-3 rounded-md border-2 border-transparent text-white transition-all duration-400 hover:from-white hover:to-white hover:border-orange hover:text-orange ",
        grayGradient:
          "inline-flex items-center gap-2 rounded bg-gradient-to-l from-slate-300 to-slate-600 px-6 py-3 text-md font-semibold text-black transition-all ease-in-out active:scale-100 disabled:pointer-events-none disabled:opacity-50",
      },
      size: {
        default: "h-9 px-4 py-4",
        sm: "py-4 h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-8 py-4",
        icon: "h-9 w-9",
        StretchedButton: "w-full px-8 py-2",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
