import * as React from 'react';
import { cn } from '../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex w-full rounded-md border bg-surface-container-high px-4 py-2.5 text-sm font-sans text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          error
            ? 'border-error focus-visible:ring-error/50'
            : 'border-outline-variant/40 focus-visible:ring-ring',
          className,
        )}
        {...props}
      />
    );
  },
);
TextArea.displayName = 'TextArea';

export { TextArea };
