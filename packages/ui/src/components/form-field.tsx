import { FormLabel } from './form-label';
import { FormError } from './form-error';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  errorId?: string;
  children: React.ReactNode;
  helperText?: string;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  errorId,
  children,
  helperText,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <FormLabel required={required}>{label}</FormLabel>
      {children}
      {error && <FormError id={errorId} message={error.message} />}
      {helperText && !error && (
        <p className="mt-1 text-xs text-on-surface-variant/70">{helperText}</p>
      )}
    </div>
  );
}
