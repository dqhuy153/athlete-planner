# Design: Unify Exercise Detail Pages

## Current State

### System page layout (`/library/[id]`)
```
Back link
VideoPlayer (youtubeEmbedUrl, gifUrl)
Title (h1) + subtitle (original name)
CustomizeSaveButton
Metadata tags (pills)
InstructionsPanel or inline instructions
Workout structure (running phases)
ExerciseActionBar (sticky bottom)
```

### Custom page layout (`/library/my/[id]`)
```
Back link
[Section: Identity] — name input
[Section: Details] — muscle group select, notes textarea
[Section: Media] — YouTube input + iframe preview, MediaUrlsManager
[Section: Instructions] — PrivateInstructionsEditor (textareas)
[Section: Workout Defaults] — NumericField grid / NumberRow config
Save Button
Delete Section
```

## Design: Unified Custom Page

### New layout (matches system page structure)
```
Back link
VideoPlayer (youtubeEmbedUrl, gifUrl) — same component, but clicking opens edit
Editable title (click-to-edit h1)
Metadata tags — same pill design, click-to-edit dropdown
InstructionsPanel — same component, click-to-edit steps
Workout structure (running) — same phase list, click-to-edit
MediaUrlsManager — below instructions, for additional links
Save Button (floating or inline)
Delete Section
```

### Approach: Click-to-Edit Pattern

Instead of a flat form, use a **read-first, click-to-edit** pattern:

1. **Default state**: Shows data using the same read-only components as the system page
2. **Click on any section**: That section becomes editable inline
3. **Blur/Save**: Section returns to read-only with updated data

This gives users the same visual experience as the system page, with editing discoverable through interaction.

### Section-by-Section Design

#### 1. Video/GIF — Use `VideoPlayer` component
- Show `VideoPlayer` exactly like system page
- Add a small "Edit" icon button overlay (top-right corner) to change the YouTube URL or GIF URL
- Click opens a small inline form to update URLs

#### 2. Title — Click-to-Edit
- Display as `<h1 className="text-subheading font-bold text-text-primary text-balance">` (same as system)
- Click switches to an `<input>` with the same text styling
- On blur, saves the name

#### 3. Source Attribution
- Keep `sourceGymName` display below title (same as current)
- Only shown for exercises copied from master library

#### 4. Metadata Tags — Click-to-Edit
- Display as pill badges (same as system page):
  - Gym: `rounded-md bg-accent-muted px-2.5 py-1 text-micro font-semibold text-accent tracking-wide uppercase`
  - Running: `rounded-md bg-success/20 px-2.5 py-1 text-micro font-semibold text-success tracking-wide uppercase`
- Click opens a `<select>` dropdown to change the value

#### 5. Notes — Click-to-Edit
- Not present on system page — show as a subtle card below metadata
- Display as read-only text (or placeholder "Add notes...")
- Click opens a textarea

#### 6. Instructions — Use `InstructionsPanel`
- For GYM exercises: Use `InstructionsPanel` with Beginner/Advanced tabs
  - Instructions stored as flat `string[]` in PrivateExercise
  - Convert to `ExerciseInstruction[]` format for the component: `[{ level: 'beginner', steps: instructions, form_cues: [] }]`
  - When editing: show `PrivateInstructionsEditor` inline
- For RUNNING exercises: Show as ordered list (same as system page)
  - When editing: show `PrivateInstructionsEditor` inline
- Click "Edit" button to switch between view/edit mode

#### 7. Workout Structure (Running)
- Display `workoutStructure` as phase list (same as system page)
- Click to edit phases (add/remove/reorder)

#### 8. Workout Defaults — Click-to-Edit
- Show as a compact summary row (e.g., "3 sets × 10 reps @ 60kg RPE 7")
- Click opens the full NumericField grid / NumberRow config

#### 9. MediaUrlsManager
- Show below instructions (additional reference links)
- Same component, same styling

#### 10. Save & Delete
- Save button: sticky or inline, with dirty indicator
- Delete: danger zone at bottom (same as current)

### Component Structure

```
PrivateExerciseDetailClient (main)
├── Back link
├── VideoPlayer (with edit overlay)
├── EditableTitle (h1 ↔ input)
├── SourceAttribution
├── MetadataTags (pills ↔ select)
├── NotesSection (text ↔ textarea)
├── InstructionsSection (InstructionsPanel ↔ PrivateInstructionsEditor)
├── WorkoutStructureSection (running phases, if applicable)
├── WorkoutDefaultsSection (summary ↔ NumericField/NumberRow)
├── MediaUrlsManager
├── SaveButton
└── DeleteZone
```

### State Management

Single `formData` state holding all fields (same as current). Each section manages its own edit state locally:

```typescript
const [editing, setEditing] = useState<{
  title: boolean;
  metadata: boolean;
  notes: boolean;
  instructions: boolean;
  workoutStructure: boolean;
  workoutDefaults: boolean;
}>({ ... });
```

### Save Strategy

Same as current — call both API endpoints sequentially:
1. `api.updatePrivateExercise(token, id, infoFields)`
2. `api.updatePrivateExerciseConfig(token, id, configFields)`

### Files to Modify

| File | Change |
|---|---|
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Full rewrite — unified layout with click-to-edit |
| `apps/web/app/[locale]/library/my/[id]/page.tsx` | May need to pass additional data (workoutStructure, mediaUrls) |

### Files NOT Modified

- `VideoPlayer.tsx` — used as-is
- `InstructionsPanel.tsx` — used as-is
- `ExerciseActionBar.tsx` — not used on custom page (user edits, doesn't start workout)
- `MediaUrlsManager.tsx` — used as-is
- `PrivateInstructionsEditor.tsx` — used as-is (for edit mode)
- System exercise detail page — no changes
