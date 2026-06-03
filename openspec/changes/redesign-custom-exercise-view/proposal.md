# Proposal: Redesign Custom Exercise Detail Page

## Problem Statement

The custom exercise detail page (`/library/my/[id]`) currently feels like an admin form rather than a personalized exercise page. Issues:

1. **Pencil icons everywhere** — edit toggles on every section make it look like a data management interface
2. **No quick actions** — missing Start Workout, Add to Today, Add to Schedule (which system exercises have via `ExerciseActionBar`)
3. **No clear view/edit separation** — mixing view and edit UI in the same layout creates visual noise
4. **Media URL addition requires full edit mode** — adding a quick YouTube link or Facebook reel means entering the entire edit form

## Goals

1. **View mode = library experience** — custom exercises look identical to system exercises (VideoPlayer, InstructionsPanel, pill badges, ExerciseActionBar)
2. **Edit mode = clean form** — single "Edit" button switches to a dedicated edit layout with Save/Cancel/Delete
3. **Quick-add media popup** — a floating button or shortcut to paste media URLs (YouTube, Facebook reels, etc.) without entering edit mode
4. **Elegant, personalized feel** — the page should feel like "my exercise", not "exercise settings"

## Non-Goals

- Changing the system exercise page
- Modifying the backend API
- Changing the ExerciseDetailView component used by the system page

## Success Criteria

- Custom exercise page renders identically to system exercise page in view mode
- ExerciseActionBar (Start Workout, Add to Today, Add to Schedule) works on custom exercises
- "Edit" button cleanly switches to edit mode
- Quick-add media popup allows pasting URLs without entering edit mode
- No visual difference between system and custom exercise pages in view mode
