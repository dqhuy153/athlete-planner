# Proposal: Unify Custom Exercise Detail Page with System Exercise Detail Page

## Problem Statement

The custom exercise detail page (`/library/my/[id]`) and the system exercise detail page (`/library/[id]`) look completely different:

**System page** uses:
- `VideoPlayer` — YouTube/GIF with play button overlay
- `InstructionsPanel` — structured gym instructions with beginner/advanced tabs
- Running instructions as numbered list
- Workout structure as numbered phases
- Pill badges for muscle group / running type
- `ExerciseActionBar` — sticky bottom bar (Start Workout, Add to Today, Add to Schedule)

**Custom page** uses:
- Raw form inputs in section cards (Identity, Details, Media, Instructions, Workout Defaults)
- Custom YouTube preview (raw iframe)
- `MediaUrlsManager` for media URLs
- `PrivateInstructionsEditor` for step editing
- No `VideoPlayer`, no `InstructionsPanel`, no `ExerciseActionBar`
- Save button + Delete button at bottom

This creates a jarring experience — users click from a system exercise to their custom copy and see a completely different UI. The custom page feels like a different app.

## Goals

1. **Same visual layout** — custom exercise page uses the same shared components and layout as the system page
2. **Same shared components** — `VideoPlayer`, `InstructionsPanel`, pill badges, `ExerciseActionBar`
3. **Editability is the only difference** — custom exercises are editable (click-to-edit or inline edit), system exercises are read-only
4. **Preserve save/delete** — custom page retains save and delete functionality

## Non-Goals

- Changing the system exercise page layout
- Adding new shared components (reuse existing ones)
- Changing the backend API

## Success Criteria

- Both pages render identical layouts for the same exercise data
- Custom exercise page uses `VideoPlayer`, `InstructionsPanel`, pill badges, `ExerciseActionBar`
- Custom exercise page supports editing with save/delete
- No visual differences between the two pages except edit controls
