# Design: Redesign Custom Exercise Detail Page

## Approach: Full-Page Mode Toggle + Quick-Add Media Popup

### Two Distinct Modes

**View Mode** (default):
- Identical layout to system exercise page
- VideoPlayer, title, pill badges, instructions, workout structure
- ExerciseActionBar at bottom (Start Workout, Add to Today, Add to Schedule)
- "Edit" button (top-right, subtle) to enter edit mode
- "Add Media" floating button (bottom-right) for quick URL paste

**Edit Mode**:
- Clean form layout with sections
- Name input, muscle group/running type selects, notes textarea
- YouTube URL + preview, MediaUrlsManager
- Instructions editor, workout defaults
- Save / Cancel / Delete buttons at bottom
- No ExerciseActionBar in this mode

### Component Architecture

```
PrivateExerciseDetailClient (parent, holds all state)
├── View Mode (isEditing=false)
│   ├── ExerciseDetailView (readonly=true) ← same component as system page
│   ├── ExerciseActionBar (with custom exercise support)
│   ├── Edit button (top-right)
│   └── QuickAddMediaButton (floating, opens popup)
│
├── Edit Mode (isEditing=true)
│   └── ExerciseEditView (new component)
│       ├── Back/Cancel button
│       ├── Name input
│       ├── Muscle group / Running type selects
│       ├── Notes textarea
│       ├── YouTube URL + preview
│       ├── MediaUrlsManager
│       ├── Instructions editor
│       ├── Workout defaults
│       └── Save / Delete buttons
│
└── QuickAddMediaPopup (modal, independent of modes)
    ├── URL input
    ├── URL type detection (YouTube, Facebook, other)
    └── Add button
```

### Key Design Decisions

1. **Reuse `ExerciseDetailView` for view mode** — the system page already uses it with `readonly=true`. Custom page uses the same, plus ExerciseActionBar.

2. **New `ExerciseEditView` component** — a clean form component for edit mode. Not the old `ExerciseDetailView` with pencil icons. This is a dedicated edit form.

3. **`ExerciseActionBar` needs to support PrivateExercise** — currently it handles `GymExerciseMaster | RunningExerciseMaster | PrivateExercise`. Verify it works correctly with PrivateExercise (it already does based on code review).

4. **Quick-add media popup** — independent modal component. Saves directly to API without entering edit mode. Shows URL input with type detection (YouTube/Facebook/other). After adding, refreshes exercise data.

5. **Edit button placement** — top-right corner, uses `Pencil` icon from lucide-react. Subtle in view mode, prominent.

### View Mode Layout

```
┌─────────────────────────────────────┐
│ ← My Library              [Edit ✏️] │
│                                     │
│ ┌─ VideoPlayer ───────────────────┐ │
│ │ YouTube / GIF with play overlay │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Exercise Name                       │
│ English subtitle                    │
│                                     │
│ [Chest] [Shoulders]                 │
│                                     │
│ ┌─ Instructions ──────────────────┐ │
│ │ InstructionsPanel / numbered    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Workout Structure ─────────────┐ │
│ │ Phase cards (running)           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Notes ─────────────────────────┐ │
│ │ Personal notes (if any)         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [▶ Start Workout] [📅 Today] [📅]  │
│                          [➕ Media] │ ← floating button
└─────────────────────────────────────┘
```

### Edit Mode Layout

```
┌─────────────────────────────────────┐
│ ← Cancel                           │
│                                     │
│ ┌─ Name ──────────────────────────┐ │
│ │ [Exercise Name input]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Details ───────────────────────┐ │
│ │ Muscle Group [dropdown]         │ │
│ │ Notes [textarea]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Media ─────────────────────────┐ │
│ │ YouTube URL + preview           │ │
│ │ Media URLs list                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Instructions ──────────────────┐ │
│ │ Step editor                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Workout Defaults ──────────────┐ │
│ │ Sets / Reps / Weight / RPE     │ │
│ │ Rest / Rest Between            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Save Changes]                      │
│ [Delete Exercise]                   │
└─────────────────────────────────────┘
```

### Quick-Add Media Popup

```
┌─────────────────────────────────────┐
│ Add Media                    [X]    │
│                                     │
│ Paste a URL (YouTube, Facebook,     │
│ Instagram, or any video link)       │
│                                     │
│ [https://youtube.com/watch?v=...]   │
│                                     │
│ Detected: YouTube ✓                 │
│                                     │
│ [Add Media]                         │
└─────────────────────────────────────┘
```

- Opens as a bottom sheet on mobile, centered modal on desktop
- Auto-detects URL type (YouTube, Facebook, other)
- Saves directly via `api.updatePrivateExercise(token, id, { mediaUrls: [...existing, newUrl] })`
- Refreshes exercise data after adding
- Shows success toast/feedback

### State Management

```typescript
// In PrivateExerciseDetailClient
const [isEditing, setIsEditing] = useState(false);
const [showQuickAddMedia, setShowQuickAddMedia] = useState(false);
const [exercise, setExercise] = useState<PrivateExercise>(initialExercise);

// Quick-add media handler
async function handleQuickAddMedia(url: string) {
  const updated = [...(exercise.mediaUrls ?? []), url];
  await api.updatePrivateExercise(token, exercise.id, { mediaUrls: updated });
  setExercise({ ...exercise, mediaUrls: updated });
}
```

### Files to Modify

| File | Change |
|---|---|
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Refactor: view/edit mode toggle, ExerciseActionBar, quick-add media |
| `apps/web/components/ExerciseEditView.tsx` | **New** — dedicated edit form component |
| `apps/web/components/QuickAddMediaPopup.tsx` | **New** — quick-add media URL modal |
| `apps/web/components/ExerciseDetailView.tsx` | Minor: ensure private exercise view mode works correctly |
| `apps/web/messages/vi.json` | Add i18n keys for new UI elements |
| `apps/web/messages/en.json` | Add i18n keys for new UI elements |

### i18n Keys (new)

Under `privateExercise`:
- `editExercise` — "Edit" / "Chỉnh sửa"
- `cancelEdit` — "Cancel" / "Hủy"
- `addMediaTitle` — "Add Media" / "Thêm media"
- `addMediaPlaceholder` — "Paste a URL..." / "Dán URL..."
- `addMediaDetected` — "Detected: {type}" / "Phát hiện: {type}"
- `addMediaSuccess` — "Media added" / "Đã thêm media"
