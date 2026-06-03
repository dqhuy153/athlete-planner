# Design: Unify Custom Exercise Detail Page with System Exercise Detail Page

## Approach: Shared `ExerciseDetailView` Component

Create a single shared component that both pages render. The only difference is a `readonly` prop — when `false`, editable controls appear.

### Target Layout (identical for both pages)

```
┌─────────────────────────────────────┐
│ ← Back to Library                   │
│                                     │
│ ┌─ VideoPlayer ───────────────────┐ │
│ │ YouTube / GIF with play overlay │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Title (h1)                          │
│ Subtitle (English name, dim)        │
│                                     │
│ ┌─ Pill Badges ───────────────────┐ │
│ │ [Muscle Group] [Secondary...]   │ │
│ │ [Running Type]                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Instructions ──────────────────┐ │
│ │ InstructionsPanel (gym)         │ │
│ │ OR numbered list (running)      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Workout Structure ─────────────┐ │
│ │ Running phases (if running)     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ System: ExerciseActionBar           │
│ Custom: Save + Delete               │
└─────────────────────────────────────┘
```

### Component Structure

```
ExerciseDetailView (shared, 'use client')
├── Back link
├── VideoPlayer
├── Title section (view: h1 + subtitle / edit: input)
├── Pill badges (view: static / edit: select dropdowns)
├── Instructions section (view: InstructionsPanel / edit: PrivateInstructionsEditor)
├── Workout structure (view: phase cards / edit: editable phases)
├── Media section (view: VideoPlayer + media list / edit: MediaUrlsManager)
├── Action bar (readonly=true: ExerciseActionBar / readonly=false: Save + Delete)
```

### Props Interface

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

  // Edit-mode state (only used when readonly=false)
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

### Edit Mode UX

When `readonly=false`:

1. **Title**: Click to edit — swaps `<h1>` with `<input>` (large, bold, same font)
2. **Muscle group / Running type**: Click badge → opens dropdown selector overlay
3. **Instructions**: Click section header → toggles between `InstructionsPanel` (view) and `PrivateInstructionsEditor` (edit)
4. **Media**: "Add Custom Media" button → opens `MediaUrlsManager` URL input
5. **Notes**: Added as a collapsible section below title (not present on system page)
6. **Workout defaults**: Added as a collapsible section (not present on system page)

Key principle: **View mode is the default.** User clicks to enter edit mode for a section. Only one section edits at a time. Save persists all changes.

### Section Edit Toggles

Each editable section has a small edit icon (pencil from lucide-react) in the top-right corner. Clicking it toggles that section between view and edit mode.

```
Section Header                    [Edit icon]
┌─────────────────────────────────────────────┐
│ View mode: InstructionsPanel / pill badges  │
│ Edit mode: PrivateInstructionsEditor / etc  │
└─────────────────────────────────────────────┘
```

### State Management

The `ExerciseDetailView` is a **controlled component** when `readonly=false`:
- All edit state lives in the parent (`PrivateExerciseDetailClient`)
- The component receives current values + change callbacks
- Parent handles save/delete via API calls

This keeps the shared component pure — no internal state for edit mode, all controlled by props.

### What Changes vs. What Stays

| Element | System Page | Custom Page (new) |
|---|---|---|
| Back link | `← Gym` / `← Running` | `← My Library` |
| VideoPlayer | Same | Same |
| Title | `<h1>` | `<h1>` (click to edit) |
| Subtitle | English name | English name |
| Pill badges | Static | Click to edit |
| Instructions | InstructionsPanel | InstructionsPanel (click to edit) |
| Running instructions | Numbered list | Numbered list (click to edit) |
| Workout structure | Phase cards | Phase cards |
| Media | Not shown | VideoPlayer + media list |
| Bottom bar | ExerciseActionBar | Save + Delete buttons |
| Notes | Not shown | Editable section (custom only) |
| Workout defaults | Not shown | Editable section (custom only) |

### Files to Modify

| File | Change |
|---|---|
| `apps/web/components/ExerciseDetailView.tsx` | **New** — shared view/edit component |
| `apps/web/app/[locale]/library/[id]/page.tsx` | Refactor to use `ExerciseDetailView` (readonly) |
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Refactor to use `ExerciseDetailView` (editable) |
| `apps/web/app/[locale]/library/my/[id]/page.tsx` | Minor — pass editMedia prop |
| `apps/web/messages/vi.json` | Add i18n keys for edit mode |
| `apps/web/messages/en.json` | Add i18n keys for edit mode |

### i18n Keys (new)

Under `privateExercise`:
- `editSection` — "Edit"
- `doneEditing` — "Done"
- `notesPlaceholder` — "Add notes about this exercise..."
- `sourceFrom` — "Copied from {name}"
