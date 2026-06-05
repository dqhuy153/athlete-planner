# Tasks: Redesign Custom Exercise Detail Page

## Task 1: Create `QuickAddMediaPopup` Component ✅

**File:** `apps/web/components/QuickAddMediaPopup.tsx` (new)

### What:
A modal/bottom-sheet component for quickly adding media URLs without entering edit mode.

### Features:
- URL input with auto-detection (YouTube, Facebook, Instagram, other)
- Shows detected type with icon
- Validates URL format
- Calls API to update exercise mediaUrls
- Shows success feedback
- Mobile: bottom sheet. Desktop: centered modal.

### Props:
```typescript
interface QuickAddMediaPopupProps {
  open: boolean;
  onClose: () => void;
  exerciseId: string;
  existingUrls: string[];
  onMediaAdded: (updatedUrls: string[]) => void;
}
```

### Implementation:
- Use `BottomSheet` from `@athlete-planner/ui` for mobile
- URL detection: check hostname for youtube.com, youtu.be, facebook.com, instagram.com
- Icons: `Youtube` (red), `Facebook` (blue), `ExternalLink` (default) from lucide-react
- After adding: call `api.updatePrivateExercise(token, id, { mediaUrls })`, then `onMediaAdded(updatedUrls)`
- Input styling: same as existing `MediaUrlsManager` input (`rounded-xl border border-input-border bg-input-bg`)

---

## Task 2: Create `ExerciseEditView` Component ✅

**File:** `apps/web/components/ExerciseEditView.tsx` (new)

### What:
A dedicated edit form for custom exercises. Clean, focused layout — not mixed with view UI.

### Layout:
1. Cancel button (top-left)
2. Name input (large, bold)
3. Muscle group / Running type select
4. Notes textarea
5. YouTube URL + preview
6. MediaUrlsManager
7. Instructions editor (PrivateInstructionsEditor)
8. Workout defaults (NumericField/NumberRow for gym, intensity/distance/duration/pace/HR for running)
9. Save button (full-width, accent)
10. Delete button (danger, bottom)

### Props:
```typescript
interface ExerciseEditViewProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
  // All form state + setters (same as current PrivateExerciseDetailClient)
  formState: { ... };
  formSetters: { ... };
}
```

### Key implementation:
- Move `NumericField`, `NumberRow`, `secsToMMSS`, constants from current `ExerciseDetailView` into this component
- Clean section styling: `rounded-[20px] border border-border bg-surface-1 p-4`
- Section headers: `text-xs font-semibold uppercase tracking-wider text-text-secondary`
- All inputs use `border-input-border bg-input-bg` tokens
- Save button: `variant="accent"` full-width with loading/saved states
- Delete: danger zone at bottom with confirmation

---

## Task 3: Refactor `PrivateExerciseDetailClient` — View/Edit Mode Toggle ✅

**File:** `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

### What:
Refactor to support two modes: view (library-like) and edit (form).

### Changes:
1. Add `isEditing` state (default `false`)
2. Add `showQuickAddMedia` state for the popup
3. **View mode** (isEditing=false):
   - Render `ExerciseDetailView` with `readonly={true}`
   - Render `ExerciseActionBar` (works with PrivateExercise already)
   - Show "Edit" button (top-right, `Pencil` icon)
   - Show "Add Media" floating button (bottom-right, `Plus` icon)
4. **Edit mode** (isEditing=true):
   - Render `ExerciseEditView` with all form state
   - Cancel button returns to view mode
5. Render `QuickAddMediaPopup` (controlled by `showQuickAddMedia`)
6. Keep all state management, save/delete handlers, isDirty tracking

### JSX structure:
```tsx
{isEditing ? (
  <ExerciseEditView
    exercise={exercise}
    locale={locale}
    onSave={handleSave}
    onCancel={() => setIsEditing(false)}
    onDelete={handleDelete}
    formState={...}
    formSetters={...}
  />
) : (
  <>
    {/* Edit button */}
    <button onClick={() => setIsEditing(true)}>
      <Pencil size={16} />
    </button>

    <ExerciseDetailView
      exercise={exercise}
      locale={locale}
      readonly
    />

    <ExerciseActionBar exercise={exercise} locale={locale} />

    {/* Floating add media button */}
    <button onClick={() => setShowQuickAddMedia(true)}>
      <Plus size={20} />
    </button>

    <QuickAddMediaPopup
      open={showQuickAddMedia}
      onClose={() => setShowQuickAddMedia(false)}
      exerciseId={exercise.id}
      existingUrls={exercise.mediaUrls ?? []}
      onMediaAdded={(urls) => setExercise({ ...exercise, mediaUrls: urls })}
    />
  </>
)}
```

---

## Task 4: Update i18n Files ✅

**Files:**
- `apps/web/messages/vi.json`
- `apps/web/messages/en.json`

### New keys under `privateExercise`:
```json
{
  "editExercise": "Chỉnh sửa" / "Edit",
  "cancelEdit": "Hủy" / "Cancel",
  "addMediaTitle": "Thêm media" / "Add Media",
  "addMediaPlaceholder": "Dán URL video..." / "Paste a video URL...",
  "addMediaDetected": "Phát hiện: {type}" / "Detected: {type}",
  "addMediaSuccess": "Đã thêm media" / "Media added"
}
```

---

## Task 5: Verify & Test ✅

1. Run TypeScript check: `pnpm --filter web exec tsc --noEmit`
2. Manual test:
   - View mode: verify identical layout to system page
   - View mode: ExerciseActionBar works (Start Workout, Add to Today, Add to Schedule)
   - View mode: "Edit" button switches to edit mode
   - Edit mode: all fields editable, Save persists changes
   - Edit mode: Cancel returns to view mode
   - Edit mode: Delete works with confirmation
   - Quick-add media: popup opens, paste YouTube URL, detects type, adds to exercise
   - Quick-add media: popup opens, paste Facebook URL, detects type, adds
   - Quick-add media: duplicate URL shows error
   - Both modes: mobile responsive
   - Both modes: dark mode
