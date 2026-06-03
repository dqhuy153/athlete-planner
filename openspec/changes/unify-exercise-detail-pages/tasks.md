# Tasks: Unify Custom Exercise Detail Page with System Exercise Detail Page

## Task 1: Create Shared `ExerciseDetailView` Component ✅

**File:** `apps/web/components/ExerciseDetailView.tsx` (new)

### What:
Create a shared component that renders exercise detail in a unified layout. Both system and custom pages will use this component.

### Props:
```typescript
interface ExerciseDetailViewProps {
  exercise: GymExerciseMaster | RunningExerciseMaster | PrivateExercise;
  locale: string;
  readonly?: boolean;          // default true
  sourceGymName?: string | null;
  editMedia?: boolean;

  // Edit-mode callbacks (only used when readonly=false)
  onSave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onNameChange?: (name: string) => void;
  onMuscleGroupChange?: (mg: MuscleGroup | '') => void;
  onRunningTypeChange?: (rt: RunningType | '') => void;
  onNotesChange?: (notes: string) => void;
  onInstructionsChange?: (instructions: string[]) => void;
  onMediaUrlsChange?: (urls: string[]) => void;
  onYoutubeChange?: (url: string) => void;

  // Edit-mode state
  editState?: {
    name: string;
    muscleGroup: MuscleGroup | '';
    runningType: RunningType | '';
    notes: string;
    instructions: string[];
    mediaUrls: string[];
    youtubeEmbedUrl: string;
    saving?: boolean;
    saveDone?: boolean;
    isDirty?: boolean;
  };
}
```

### Layout (always the same):
1. Back link
2. `VideoPlayer` (shared component)
3. Title (`<h1>` / input based on readonly)
4. Pill badges for muscle group / running type
5. Instructions section (`InstructionsPanel` for gym, numbered list for running)
6. Workout structure (running only)
7. Bottom bar (`ExerciseActionBar` when readonly, Save+Delete when editable)

### Edit mode (readonly=false):
- Each editable section has a pencil icon (`Pencil` from lucide-react) in the top-right
- Clicking pencil toggles that section between view and edit mode
- Only one section edits at a time
- Notes and Workout defaults sections only appear in editable mode
- Media section uses `MediaUrlsManager` when editing

### Key implementation details:
- Import and use existing shared components: `VideoPlayer`, `InstructionsPanel`, `ExerciseActionBar`
- Use `cn` from `@athlete-planner/ui` for conditional classes
- Use `useTranslations` for i18n
- Exercise type detection: `isGymExercise()`, `isRunningExercise()` helper functions
- Muscle group translation: use `t('chest')`, `t('back')`, etc. from `library` namespace
- Running type translation: use `t('intervalType')`, `t('easyType')`, etc.
- Running workout structure: numbered phase cards with `font-data` for numbers
- Section styling: `rounded-[20px] border border-border bg-surface-1 p-4` (matching existing)

---

## Task 2: Refactor System Exercise Page to Use Shared Component ✅

**File:** `apps/web/app/[locale]/library/[id]/page.tsx`

### What:
Replace the current inline JSX with `ExerciseDetailView` (readonly=true).

### Changes:
1. Import `ExerciseDetailView` from `@/components/ExerciseDetailView`
2. Remove direct imports of `VideoPlayer`, `InstructionsPanel` (now inside shared component)
3. Remove `isGym()`, `isRunning()`, `translateMuscleGroup()`, `translateRunningType()` helpers (now inside shared component)
4. Keep `CustomizeSaveButton` and `AddCustomMediaButton` imports (rendered outside `ExerciseDetailView`)
5. Replace the entire exercise detail JSX block with:
   ```tsx
   <ExerciseDetailView
     exercise={exercise}
     locale={locale}
     readonly
   />
   ```
6. Keep `CustomizeSaveButton` and `AddCustomMediaButton` rendered between the back link and `ExerciseDetailView` (or pass them as children/slots)

### Note:
The `CustomizeSaveButton` and `AddCustomMediaButton` are system-page-specific. They should be rendered by the system page, not inside `ExerciseDetailView`. Either:
- Option A: Render them outside `ExerciseDetailView` in the page
- Option B: Add a `actions` slot prop to `ExerciseDetailView`

**Decision: Option A** — keep them outside the shared component, rendered in the page after the back link.

---

## Task 3: Refactor Custom Exercise Page to Use Shared Component ✅

**File:** `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

### What:
Replace the current form-based layout with `ExerciseDetailView` (readonly=false).

### Changes:
1. Import `ExerciseDetailView` from `@/components/ExerciseDetailView`
2. Remove all inline JSX for sections (Identity, Details, Media, Instructions, Workout Defaults)
3. Remove `NumericField`, `NumberRow` helper components (move inside `ExerciseDetailView`)
4. Keep all state management (name, muscleGroup, etc.) — these become editState props
5. Keep `handleSave`, `handleDelete`, `isDirty`, `beforeunload` logic
6. Replace the JSX with:
   ```tsx
   <ExerciseDetailView
     exercise={exercise}
     locale={locale}
     readonly={false}
     editMedia={editMedia}
     sourceGymName={sourceGymName}
     onSave={handleSave}
     onDelete={handleDelete}
     onNameChange={setName}
     onMuscleGroupChange={setMuscleGroup}
     onRunningTypeChange={setRunningTypeState}
     onNotesChange={setNotes}
     onInstructionsChange={setInstructions}
     onMediaUrlsChange={setMediaUrls}
     onYoutubeChange={setYoutubeEmbedUrl}
     editState={{
       name, muscleGroup, runningType: runningTypeState,
       notes, instructions, mediaUrls, youtubeEmbedUrl,
       saving, saveDone, isDirty: isDirty(),
     }}
   />
   ```

### What gets removed from this file:
- `NumericField` component (move to `ExerciseDetailView`)
- `NumberRow` component (move to `ExerciseDetailView`)
- All section JSX blocks (Identity, Details, Media, Instructions, Workout Defaults)
- `MUSCLE_GROUPS`, `RUNNING_TYPES`, `INTENSITY_OPTIONS`, `HR_ZONES` constants (move to `ExerciseDetailView`)
- `secsToMMSS` helper (move to `ExerciseDetailView`)

### What stays in this file:
- All `useState` hooks for form state
- `useEffect` for `beforeunload`
- `useEffect` for `editMedia` auto-focus
- `useRef` for `mediaUrlsRef`
- `isDirty` callback
- `handleSave` function
- `handleDelete` function

---

## Task 4: Update i18n Files ✅

**Files:**
- `apps/web/messages/vi.json`
- `apps/web/messages/en.json`

### New keys under `privateExercise`:
```json
{
  "editSection": "Chỉnh sửa" / "Edit",
  "doneEditing": "Xong" / "Done",
  "notesPlaceholder": "Thêm ghi chú về bài tập..." / "Add notes about this exercise...",
  "sourceFrom": "Sao chép từ {name}" / "Copied from {name}"
}
```

---

## Task 5: Verify & Test ✅

1. Run TypeScript check: `pnpm --filter web exec tsc --noEmit`
2. Run TypeScript check: `pnpm --filter api exec tsc --noEmit`
3. Manual test:
   - System page: verify identical layout (VideoPlayer, InstructionsPanel, pill badges, ActionBar)
   - Custom page: verify same layout with editable controls
   - Custom page: click pencil icons to toggle edit mode
   - Custom page: save changes, verify persistence
   - Custom page: delete exercise
   - Custom page: test `?editMedia=true` auto-focus flow
   - Both pages: verify mobile responsiveness
   - Both pages: verify dark mode
