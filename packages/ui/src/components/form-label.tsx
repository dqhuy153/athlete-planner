interface FormLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({
  htmlFor,
  required = false,
  children,
  className = '',
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1 block text-sm font-medium text-on-surface-variant ${className}`}
    >
      {children}
      {required && <span className="ml-0.5 text-error">*</span>}
    </label>
  );
}
