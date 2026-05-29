# Forms Error Display & Documentation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:dispatching-parallel-agents to execute both task streams (forms + docs) in parallel, OR superpowers:subagent-driven-development for sequential task-by-task execution with review.

**Goal:** Enable consistent inline error display across all Zod-validated forms with reusable accessible components, and audit/update all user-authored documentation to match current codebase state.

**Architecture:**
- **Forms:** Create reusable FormError & FormLabel components in UI library with accessibility attributes (aria-invalid, aria-describedby), then update Input/Select/TextArea to support error state styling, then retrofit all admin wizards/editors with field-level error display.
- **Docs:** Scan all user-created `.md` files (excluding auto-generated spec/skills), read codebase state, then update each doc to reflect latest architecture, configuration, and patterns.

**Tech Stack:** React Hook Form, Zod, shadcn/ui patterns, next-intl, NestJS, Prisma

---

## TASK STREAM 1: FORMS & UI COMPONENTS

### Task 1.1: Create FormError Component in UI Library

**Files:**
- Create: `packages/ui/src/components/form-error.tsx`
- Modify: `packages/ui/src/components/index.ts` (export)

- [ ] **Step 1: Create FormError component with accessibility**

```tsx
// packages/ui/src/components/form-error.tsx
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
```

- [ ] **Step 2: Add FormLabel component with accessibility**

```tsx
// packages/ui/src/components/form-label.tsx
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
```

- [ ] **Step 3: Export both from index.ts**

```tsx
// packages/ui/src/components/index.ts
// Add:
export { FormError } from './form-error';
export { FormLabel } from './form-label';
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/form-error.tsx packages/ui/src/components/form-label.tsx packages/ui/src/components/index.ts
git commit -m "feat(ui): add FormError and FormLabel components with accessibility"
```

---

### Task 1.2: Update Input Component to Support Error State

**Files:**
- Modify: `packages/ui/src/components/input.tsx`

- [ ] **Step 1: Add error-specific styling to Input**

```tsx
// packages/ui/src/components/input.tsx
import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-9 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors ${
        error
          ? 'border-error focus:ring-error/50'
          : 'border-border focus:ring-primary'
      } ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/input.tsx
git commit -m "feat(ui): add error styling to Input component"
```

---

### Task 1.3: Update Select Component to Support Error State

**Files:**
- Modify: `packages/ui/src/components/select.tsx`

- [ ] **Step 1: Add error prop and styling to select wrapper**

```tsx
// packages/ui/src/components/select.tsx
import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, ...props }, ref) => (
    <select
      className={`flex h-9 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors appearance-none cursor-pointer ${
        error
          ? 'border-error focus:ring-error/50'
          : 'border-border focus:ring-primary'
      } ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
);
Select.displayName = "Select"

export { Select }
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/select.tsx
git commit -m "feat(ui): add error styling to Select component"
```

---

### Task 1.4: Update Textarea Component to Support Error State

**Files:**
- Modify: `packages/ui/src/components/textarea.tsx`

- [ ] **Step 1: Add error prop and styling to textarea**

```tsx
// packages/ui/src/components/textarea.tsx
import * as React from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      className={`flex min-h-24 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors resize-none ${
        error
          ? 'border-error focus:ring-error/50'
          : 'border-border focus:ring-primary'
      } ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea"

export { Textarea }
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/textarea.tsx
git commit -m "feat(ui): add error styling to Textarea component"
```

---

### Task 1.5: Create FormField Helper Component

**Files:**
- Create: `packages/ui/src/components/form-field.tsx`
- Modify: `packages/ui/src/components/index.ts` (export)

- [ ] **Step 1: Create FormField wrapper for consistent field layout**

```tsx
// packages/ui/src/components/form-field.tsx
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
```

- [ ] **Step 2: Export from index.ts**

```tsx
// packages/ui/src/components/index.ts
// Add:
export { FormField } from './form-field';
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/form-field.tsx packages/ui/src/components/index.ts
git commit -m "feat(ui): add FormField wrapper component for consistent field layout"
```

---

### Task 1.6: Fix GymExerciseWizard with Complete Error Display

**Files:**
- Modify: `apps/admin-web/components/exercises/GymExerciseWizard.tsx`

- [ ] **Step 1: Import FormLabel and FormError**

At top of file, add:
```tsx
import { FormLabel, FormError } from '@athlete-planner/ui';
```

- [ ] **Step 2: Update Step 0 (Basic Info) with error display**

Replace the Step 0 section (lines 138-217) with:

```tsx
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="name" required>Exercise name</FormLabel>
              <input
                id="name"
                {...register('name')}
                placeholder="e.g. Barbell Back Squat"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="name-error" message={errors.name?.message} />
            </div>

            <div>
              <FormLabel htmlFor="vietnameseName" required>Vietnamese name</FormLabel>
              <input
                id="vietnameseName"
                {...register('vietnameseName')}
                placeholder="e.g. Squat tạ đòn"
                aria-invalid={!!errors.vietnameseName}
                aria-describedby={errors.vietnameseName ? 'vietnameseName-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="vietnameseName-error" message={errors.vietnameseName?.message} />
            </div>

            <div>
              <FormLabel htmlFor="targetMuscleGroup" required>Target muscle group</FormLabel>
              <select
                id="targetMuscleGroup"
                {...register('targetMuscleGroup')}
                aria-invalid={!!errors.targetMuscleGroup}
                aria-describedby={errors.targetMuscleGroup ? 'targetMuscleGroup-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg}
                  </option>
                ))}
              </select>
              <FormError id="targetMuscleGroup-error" message={errors.targetMuscleGroup?.message} />
            </div>

            <div>
              <FormLabel htmlFor="secondaryMuscleGroups">
                Secondary muscles{' '}
                <span className="text-xs text-on-surface-variant/60">(comma-separated)</span>
              </FormLabel>
              <input
                id="secondaryMuscleGroups"
                {...register('secondaryMuscleGroups')}
                placeholder="e.g. Glutes, Hamstrings"
                aria-invalid={!!errors.secondaryMuscleGroups}
                aria-describedby={errors.secondaryMuscleGroups ? 'secondaryMuscleGroups-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="secondaryMuscleGroups-error" message={errors.secondaryMuscleGroups?.message} />
            </div>

            <div>
              <FormLabel htmlFor="garminExerciseEnum">Garmin exercise enum</FormLabel>
              <input
                id="garminExerciseEnum"
                {...register('garminExerciseEnum')}
                placeholder="e.g. SQUAT"
                aria-invalid={!!errors.garminExerciseEnum}
                aria-describedby={errors.garminExerciseEnum ? 'garminExerciseEnum-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="garminExerciseEnum-error" message={errors.garminExerciseEnum?.message} />
            </div>
          </div>
        )}
```

- [ ] **Step 3: Update Step 2 (Media) with error display**

Replace the Step 2 section (lines 224-263) with:

```tsx
        {/* Step 2: Media */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="youtubeEmbedUrl">YouTube embed URL</FormLabel>
              <input
                id="youtubeEmbedUrl"
                type="url"
                {...register('youtubeEmbedUrl')}
                placeholder="https://www.youtube.com/embed/..."
                aria-invalid={!!errors.youtubeEmbedUrl}
                aria-describedby={errors.youtubeEmbedUrl ? 'youtubeEmbedUrl-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="youtubeEmbedUrl-error" message={errors.youtubeEmbedUrl?.message} />
            </div>

            <div>
              <FormLabel htmlFor="gifUrl">GIF / Image URL</FormLabel>
              <input
                id="gifUrl"
                type="url"
                {...register('gifUrl')}
                placeholder="https://..."
                aria-invalid={!!errors.gifUrl}
                aria-describedby={errors.gifUrl ? 'gifUrl-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="gifUrl-error" message={errors.gifUrl?.message} />
              {watchedValues.gifUrl && (
                <img
                  src={watchedValues.gifUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-auto rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        )}
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin-web/components/exercises/GymExerciseWizard.tsx
git commit -m "feat(admin): add inline error display with accessibility to GymExerciseWizard"
```

---

### Task 1.7: Fix RunningExerciseWizard with Complete Error Display

**Files:**
- Modify: `apps/admin-web/components/exercises/RunningExerciseWizard.tsx`

- [ ] **Step 1: Import FormLabel and FormError**

At top of file, add:
```tsx
import { FormLabel, FormError } from '@athlete-planner/ui';
```

- [ ] **Step 2: Update Step 0 (Basic Info) with error display**

Find lines around basic info section and apply same pattern as Task 1.6 (FormLabel for labels, FormError below inputs, aria-invalid/aria-describedby on fields).

```tsx
            <div>
              <FormLabel htmlFor="name" required>Exercise name</FormLabel>
              <input
                id="name"
                {...register('name')}
                placeholder="e.g. 5K easy run"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="name-error" message={errors.name?.message} />
            </div>

            <div>
              <FormLabel htmlFor="vietnameseName" required>Vietnamese name</FormLabel>
              <input
                id="vietnameseName"
                {...register('vietnameseName')}
                placeholder="e.g. Chạy bộ nhẹ 5km"
                aria-invalid={!!errors.vietnameseName}
                aria-describedby={errors.vietnameseName ? 'vietnameseName-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="vietnameseName-error" message={errors.vietnameseName?.message} />
            </div>

            <div>
              <FormLabel htmlFor="runningType" required>Running type</FormLabel>
              <select
                id="runningType"
                {...register('runningType')}
                aria-invalid={!!errors.runningType}
                aria-describedby={errors.runningType ? 'runningType-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select type</option>
                <option value="EASY">Easy</option>
                <option value="TEMPO">Tempo</option>
                <option value="INTERVAL">Interval</option>
                <option value="LONG_RUN">Long Run</option>
                <option value="RECOVERY">Recovery</option>
              </select>
              <FormError id="runningType-error" message={errors.runningType?.message} />
            </div>
```

- [ ] **Step 3: Update Step 2 (Media) with error display**

```tsx
            <div>
              <FormLabel htmlFor="youtubeEmbedUrl">YouTube embed URL</FormLabel>
              <input
                id="youtubeEmbedUrl"
                type="url"
                {...register('youtubeEmbedUrl')}
                placeholder="https://www.youtube.com/embed/..."
                aria-invalid={!!errors.youtubeEmbedUrl}
                aria-describedby={errors.youtubeEmbedUrl ? 'youtubeEmbedUrl-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="youtubeEmbedUrl-error" message={errors.youtubeEmbedUrl?.message} />
            </div>

            <div>
              <FormLabel htmlFor="gifUrl">GIF / Image URL</FormLabel>
              <input
                id="gifUrl"
                type="url"
                {...register('gifUrl')}
                placeholder="https://..."
                aria-invalid={!!errors.gifUrl}
                aria-describedby={errors.gifUrl ? 'gifUrl-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="gifUrl-error" message={errors.gifUrl?.message} />
              {watchedValues.gifUrl && (
                <img
                  src={watchedValues.gifUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-auto rounded-lg object-cover"
                />
              )}
            </div>
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin-web/components/exercises/RunningExerciseWizard.tsx
git commit -m "feat(admin): add inline error display with accessibility to RunningExerciseWizard"
```

---

### Task 1.8: Fix InstructionsEditor with Nested Array Error Display

**Files:**
- Modify: `apps/admin-web/components/exercises/InstructionsEditor.tsx`

- [ ] **Step 1: Import FormLabel and FormError**

```tsx
import { FormLabel, FormError } from '@athlete-planner/ui';
```

- [ ] **Step 2: Add error display for steps and form_cues fields**

For each array item (step/form_cue), wrap input and add FormError below:

```tsx
// Pattern for each input in nested array:
<div>
  <input
    {...register(`instructions.${i}.steps_en.${j}.value`)}
    placeholder="Step..."
    aria-invalid={!!errors.instructions?.[i]?.steps_en?.[j]?.value}
    aria-describedby={errors.instructions?.[i]?.steps_en?.[j]?.value ? `steps-en-${i}-${j}-error` : undefined}
    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
  />
  <FormError
    id={`steps-en-${i}-${j}-error`}
    message={errors.instructions?.[i]?.steps_en?.[j]?.value?.message}
  />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/components/exercises/InstructionsEditor.tsx
git commit -m "feat(admin): add inline error display to InstructionsEditor nested array fields"
```

---

### Task 1.9: Fix WorkoutStructureEditor with Nested Array Error Display

**Files:**
- Modify: `apps/admin-web/components/exercises/WorkoutStructureEditor.tsx`

- [ ] **Step 1: Import FormLabel and FormError**

```tsx
import { FormLabel, FormError } from '@athlete-planner/ui';
```

- [ ] **Step 2: Add error display for all phase fields**

For each field in the nested workoutStructure array, apply same pattern as Task 1.8:

```tsx
// Pattern for each nested field:
<div>
  <FormLabel htmlFor={`phase-name-${i}`}>Phase name</FormLabel>
  <input
    id={`phase-name-${i}`}
    {...register(`workoutStructure.${i}.phaseName`)}
    aria-invalid={!!errors.workoutStructure?.[i]?.phaseName}
    aria-describedby={errors.workoutStructure?.[i]?.phaseName ? `phaseName-${i}-error` : undefined}
    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
  />
  <FormError
    id={`phaseName-${i}-error`}
    message={errors.workoutStructure?.[i]?.phaseName?.message}
  />
</div>
```

Repeat for all 14 fields: `phaseName`, `duration`, `focus`, `weeklyRunCount`, `avgDistance`, `targetPace`, `emphasis`, `intensityDistribution`, `recovery`, `progressionStrategy`, `adaptations`, `assessmentMetrics`, `transitionNotes`, `notes`.

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/components/exercises/WorkoutStructureEditor.tsx
git commit -m "feat(admin): add inline error display to WorkoutStructureEditor all nested fields"
```

---

### Task 1.10: Build and Test All Forms

**Files:**
- Test all components via admin-web

- [ ] **Step 1: Build packages/ui**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter @athlete-planner/ui build
```

Expected: No TypeScript errors, successful build.

- [ ] **Step 2: Build admin-web**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter admin-web build
```

Expected: No TypeScript errors, successful build.

- [ ] **Step 3: Manual test: GymExerciseWizard**

1. Navigate to admin-web `/exercises/new`
2. Try to click "Next" with empty fields
3. Verify inline error messages appear below each required field (name, vietnameseName, targetMuscleGroup)
4. Verify error icons appear next to error text
5. Verify inputs have red border when focused while showing error

- [ ] **Step 4: Manual test: RunningExerciseWizard**

1. Navigate to admin-web `/exercises/running/new`
2. Try to click "Next" with empty fields
3. Verify inline error messages appear for name, vietnameseName, runningType
4. Fill in required fields, click Next to Step 1
5. Navigate to Step 2 (Media), try invalid URLs, verify error display

- [ ] **Step 5: Manual test: InstructionsEditor**

1. On GymExerciseWizard Step 1 (Instructions)
2. Try to remove all steps and form_cues
3. Verify error messages appear for nested array fields if validation fails

- [ ] **Step 6: Manual test: WorkoutStructureEditor**

1. On RunningExerciseWizard, find WorkoutStructureEditor
2. Try to submit with empty phase fields
3. Verify error messages appear for all 14 nested fields

- [ ] **Step 7: Commit build verification**

```bash
git add .
git commit -m "test(admin): verify all forms display inline errors correctly"
```

---

## TASK STREAM 2: DOCUMENTATION AUDIT & UPDATE

### Task 2.1: Find All User-Created Markdown Files

**Files:**
- Scan: `/Users/huydang/Desktop/huy/projects/monorepo-template`

- [ ] **Step 1: Find all .md files excluding auto-generated**

```bash
find /Users/huydang/Desktop/huy/projects/monorepo-template -type f -name "*.md" ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/dist/*" ! -path "*/.opencode/skills/*" ! -path "*/.agents/skills/*" ! -path "*/docs/superpowers/specs/*" ! -path "*/docs/superpowers/plans/*" | sort
```

Expected output will list user-authored files like:
- `README.md`
- `docs/MEMORY.md`
- `docs/deployment.md`
- `docs/api.md`
- `AGENTS.md`
- `apps/web/README.md`
- `apps/api/README.md`
- `apps/admin-web/README.md`
- `packages/*/README.md`
- etc.

- [ ] **Step 2: Create a checklist of files to audit**

Record the full list. For each file, plan to: (a) read current content, (b) check if it matches codebase reality, (c) update if stale.

---

### Task 2.2: Audit & Update docs/MEMORY.md

**Files:**
- Modify: `docs/MEMORY.md`

- [ ] **Step 1: Read current docs/MEMORY.md**

Capture what's there and compare to actual codebase structure.

- [ ] **Step 2: Verify sections against codebase**

Check:
- Architecture section matches apps/ layout ✓
- Backend (NestJS) sections match `apps/api/src/modules/` structure
- Frontend (Next.js) sections match `apps/web/app/` structure
- Admin sections match `apps/admin-web/app/` structure
- Database/Prisma matches `packages/database/prisma/schema.prisma`
- Auth flow matches current NextAuth v5 setup
- i18n setup matches actual `next-intl` config
- UI rules match current design tokens

- [ ] **Step 3: Update any stale sections**

If architecture doc is from earlier phase and doesn't reflect current state (e.g., mentions old patterns, missing new modules), update it to current reality.

Example areas that commonly drift:
- Module names/locations
- Environment variable names
- Database schema changes
- Auth provider setup

- [ ] **Step 4: Commit**

```bash
git add docs/MEMORY.md
git commit -m "docs: update MEMORY.md to match current codebase state"
```

---

### Task 2.3: Audit & Update docs/deployment.md

**Files:**
- Modify: `docs/deployment.md`

- [ ] **Step 1: Read current docs/deployment.md**

Verify it lists all required environment variables and deployment steps.

- [ ] **Step 2: Cross-check with actual env var usage**

Scan `.env.example` or `.env.local` files, and grep for `process.env.*` in backend/frontend to ensure all vars are documented.

Expected vars:
- Backend: DB_URL, REDIS_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, S3_*, CLOUDINARY_*, AI_*, etc.
- Frontend: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AUTH_SECRET, etc.
- Admin: Same as frontend

- [ ] **Step 3: Update deployment steps**

Verify deployment instructions match actual tooling (Vercel for web/admin-web, Node for api). Update if hosting changes.

- [ ] **Step 4: Commit**

```bash
git add docs/deployment.md
git commit -m "docs: update deployment.md with current env vars and hosting setup"
```

---

### Task 2.4: Audit & Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Read AGENTS.md**

This file provides agent context. Verify it still matches project state.

- [ ] **Step 2: Check architecture diagram**

Verify app layout, module list, and tech stack sections reflect current code structure.

- [ ] **Step 3: Verify key conventions**

Check: namespace, Prisma commands, migration commands, build/dev commands, package manager, commit style, domain models all match reality.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md to reflect latest architecture and conventions"
```

---

### Task 2.5: Audit & Update Root README.md

**Files:**
- Modify: `README.md` (root)

- [ ] **Step 1: Read root README.md**

Check if it provides good entry point for new contributors.

- [ ] **Step 2: Verify project description**

Does README accurately describe project goals and features? (e.g., "Training planner for hybrid athletes with Garmin export")

- [ ] **Step 3: Verify setup instructions**

Check if they still work:
- Node version requirements (v22.14.0)
- pnpm installation
- docker-compose for local dev
- Environment setup

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update root README.md with current setup instructions"
```

---

### Task 2.6: Audit & Update Each App/Package README.md

**Files:**
- Modify: `apps/api/README.md`, `apps/web/README.md`, `apps/admin-web/README.md`
- Modify: `packages/*/README.md` (if exists)

- [ ] **Step 1: For each app/package, read its README**

- [ ] **Step 2: Verify tech stack section**

Does it accurately describe what that app uses? (NestJS+CQRS for api, Next.js+React for web, etc.)

- [ ] **Step 3: Verify development instructions**

Are dev commands current? (e.g., `pnpm --filter api dev`)

- [ ] **Step 4: Verify key features section**

Does features list match current code? Remove deprecated features, add new ones.

- [ ] **Step 5: Update each one**

Apply updates to all READMEs.

- [ ] **Step 6: Commit**

```bash
git add apps/*/README.md packages/*/README.md
git commit -m "docs: update app and package READMEs to match current features and setup"
```

---

### Task 2.7: Check for Orphaned .md Files in docs/ Directory

**Files:**
- Scan: `docs/`

- [ ] **Step 1: List all .md files in docs/**

```bash
find /Users/huydang/Desktop/huy/projects/monorepo-template/docs -type f -name "*.md" ! -path "*/superpowers/*" | sort
```

- [ ] **Step 2: For each file, determine if it's current or stale**

Examples:
- `docs/api.md` - is this still accurate? (API endpoints, request/response shapes)
- `docs/database.md` - does it match schema.prisma?
- `docs/architecture.md` - does it match AGENTS.md or MEMORY.md? (if duplicate, consider consolidating)

- [ ] **Step 3: Update or consolidate**

If a doc is stale, update it. If it's redundant (duplicate of AGENTS.md), consider removing it and cross-referencing instead.

- [ ] **Step 4: Commit**

```bash
git add docs/*.md
git commit -m "docs: audit and update docs/ directory for consistency"
```

---

### Task 2.8: Final Documentation Review

**Files:**
- None (review only)

- [ ] **Step 1: Read AGENTS.md start-to-finish**

Verify it's the single source of truth for architecture and setup.

- [ ] **Step 2: Read MEMORY.md start-to-finish**

Verify it captures all key design decisions and patterns.

- [ ] **Step 3: Read root README.md**

Does it provide a good entry point? Should any AGENTS.md content move here?

- [ ] **Step 4: Spot-check code against docs**

Pick a random feature (e.g., "JWT auth in app/web") and verify docs accurately describe how it works vs. actual code.

- [ ] **Step 5: Create summary commit if no changes needed**

If all docs are current, create a verification commit:

```bash
git commit --allow-empty -m "docs: verify all documentation is current and accurate"
```

---

## Verification Checklist

Before marking either task stream complete, verify:

**Task Stream 1 (Forms):**
- ✅ `packages/ui` builds without errors
- ✅ `admin-web` builds without errors
- ✅ GymExerciseWizard shows inline errors on validation fail
- ✅ RunningExerciseWizard shows inline errors on validation fail
- ✅ InstructionsEditor shows errors for nested array fields
- ✅ WorkoutStructureEditor shows errors for all 20+ nested fields
- ✅ All error messages use FormError component with icon
- ✅ All form inputs have aria-invalid and aria-describedby when errors present

**Task Stream 2 (Docs):**
- ✅ docs/MEMORY.md matches current architecture
- ✅ docs/deployment.md has complete env var list
- ✅ AGENTS.md reflects latest conventions and modules
- ✅ All app/package READMEs are current
- ✅ No orphaned or duplicate .md files in docs/
- ✅ docs/ directory is organized and consistent
