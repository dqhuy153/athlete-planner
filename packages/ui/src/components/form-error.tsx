import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  id?: string;
  className?: string;
}

export function FormError({ message, id, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={`mt-1 flex items-center gap-1 text-xs text-error ${className || ''}`}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
