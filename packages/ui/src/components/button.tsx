import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium font-sans ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:border-primary/50 shadow-sm',
        destructive:
          'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30',
        outline:
          'border border-outline-variant/60 bg-surface-container/50 text-on-surface hover:bg-surface-container-high/70 hover:border-outline-variant',
        secondary:
          'bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 hover:bg-secondary-container/30',
        ghost:
          'hover:bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface',
        link: 'text-primary underline-offset-4 hover:underline',
        gold:
          'bg-gradient-to-b from-primary to-primary-container text-on-primary font-semibold border-none shadow-sm hover:opacity-90',
        // ── Minimalist Athletic variants ──────────────────────────────────
        accent:
          'bg-accent text-accent-foreground font-semibold hover:bg-accent/90 active:bg-accent/80 focus-visible:ring-accent/50',
        'accent-outline':
          'border border-accent text-accent bg-transparent hover:bg-accent/10 active:bg-accent/20 focus-visible:ring-accent/50',
        surface:
          'bg-surface-2 text-text-secondary border border-border hover:bg-surface-3 hover:text-text-primary focus-visible:ring-border',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
