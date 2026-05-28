import * as React from 'react';
import { cn } from '../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex w-full rounded-md border border-outline-variant/40 bg-surface-container-high px-4 py-2.5 text-sm font-sans text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          className,
        )}
        {...props}
      />
    );
  },
);
TextArea.displayName = 'TextArea';

export { TextArea };
