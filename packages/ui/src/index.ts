// @athlete-planner/ui — Shared UI component library

import './styles/theme.css';

export { cn } from './lib/utils';

// Shadcn primitives
export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/card';
export { Input } from './components/input';
export type { InputProps } from './components/input';
export { Select } from './components/select';
export type { SelectProps } from './components/select';
export { TextArea } from './components/textarea';
export type { TextAreaProps } from './components/textarea';

// Form components
export { FormError } from './components/form-error';
export { FormLabel } from './components/form-label';
export { FormField } from './components/form-field';

// Custom UI components
export { ToastProvider, useToast } from './components/toast';
export { BottomSheet } from './components/bottom-sheet';
export { ConfirmModal } from './components/confirm-modal';
export { NavigationGuardModal } from './components/navigation-guard-modal';
export { MarkdownRenderer } from './components/markdown-renderer';
export type { MarkdownRendererProps } from './components/markdown-renderer';
export { CardImage, CardLightbox } from './components/card-image';
export type { CardImageProps } from './components/card-image';

// Shared icons
export { SunIcon, MoonIcon, TypeIcon, TypeOffIcon } from './components/icons';
