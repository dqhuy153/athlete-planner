import * as React from 'react';
import { cn } from '../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-md border bg-surface-container-high px-4 pr-10 py-2.5 text-sm font-sans text-on-surface ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
          error
            ? 'border-error focus-visible:ring-error/50'
            : 'border-outline-variant/40 focus-visible:ring-ring',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
