# Tasks: Unify Exercise Detail Pages

## Task 1: Rewrite `PrivateExerciseDetailClient` — Unified Read-First Layout

**File:** `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

Full rewrite. New structure matches system exercise detail page layout:

```
Back link
VideoPlayer (youtubeEmbedUrl, gifUrl)
Editable title (h1 ↔ input on click)
Source attribution (if applicable)
Metadata tags (pills ↔ select on click)
Notes (read-only text ↔ textarea on click)
InstructionsPanel (gym) or ordered list (running) ↔ PrivateInstructionsEditor on edit
Workout structure phases (running, if applicable) ↔ edit mode
Workout defaults summary ↔ NumericField/NumberRow on edit
MediaUrlsManager
Save Button
Delete Zone
```

### Key implementation details:

1. **VideoPlayer**: Use `<VideoPlayer youtubeEmbedUrl={...} gifUrl={...} title={...} />` — same as system page. Add a small edit button overlay to change URLs.

2. **Title**: Default to `<h1 className="text-subheading font-bold text-text-primary text-balance">{name}</h1>`. On click, swap to `<input>` with same styling. Save on blur.

3. **Metadata tags**: Display as pills:
   - Gym: `rounded-md bg-accent-muted px-2.5 py-1 text-micro font-semibold text-accent tracking-wide uppercase`
   - Running: `rounded-md bg-success/20 px-2.5 py-1 text-micro font-semibold text-success tracking-wide uppercase`
   - On click, show `<select>` dropdown to change value.

4. **Instructions (GYM)**: Convert flat `string[]` to `ExerciseInstruction[]` format:
   ```typescript
   const gymInstructions: ExerciseInstruction[] = instructions.length > 0
     ? [{ level: ExperienceLevel.BEGINNER, steps: { vi: instructions, en: instructions }, form_cues: { vi: [], en: [] } }]
     : [];
   ```
   Pass to `<InstructionsPanel instructions={gymInstructions} locale={locale} />`.
   Add "Edit" button to switch to `PrivateInstructionsEditor`.

5. **Instructions (RUNNING)**: Display as ordered list inside `card-surface p-4` (same as system page running instructions). Add "Edit" button to switch to `PrivateInstructionsEditor`.

6. **Workout structure (running)**: If `workoutStructure` exists, display as phase list with `card-surface flex items-center gap-3 px-4 py-3` rows (same as system page).

7. **Workout defaults**: Show as a compact summary. On click, expand to full NumericField grid (gym) or NumberRow config (running).

8. **Notes**: Show as read-only text in a subtle card. On click, swap to textarea.

9. **MediaUrlsManager**: Same component, same position below instructions.

10. **Save button**: Keep unified save with dirty indicator.

11. **Delete zone**: Same as current.

### Edit state management:
```typescript
const [editingField, setEditingField] = useState<string | null>(null);
```
Only one section editable at a time. Click another section to switch. Click "Done" or blur to save and exit edit mode.

---

## Task 2: Verify TypeScript & Visual Consistency

1. Run `pnpm --filter web exec tsc --noEmit`
2. Verify custom page uses same components as system page:
   - `VideoPlayer` ✓
   - `InstructionsPanel` ✓ (for gym)
   - Same pill badge styling ✓
   - Same typography (`text-subheading`, `text-caption`, `text-micro`) ✓
3. Verify no regressions on system page
