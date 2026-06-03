# Proposal: Unify Exercise Detail Pages

## Problem

The system exercise detail page (`/library/[id]`) and the custom exercise detail page (`/library/my/[id]`) look completely different:

- **System page**: Uses `VideoPlayer`, `InstructionsPanel`, pill badges, `ExerciseActionBar` — polished, consistent
- **Custom page**: Flat form with raw inputs, no `VideoPlayer`, no `InstructionsPanel`, different layout structure

Users see two radically different experiences for the same type of content. The custom page feels like a settings form, not an exercise detail page.

## Goal

Make the custom exercise detail page visually identical to the system page, with editing capabilities layered on top. Both pages should:

- Use the same shared components (`VideoPlayer`, `InstructionsPanel`)
- Have the same layout structure (video at top, title, metadata tags, instructions, workout structure)
- Share the same typography and spacing
- Only differ in interactivity (custom = editable, system = read-only)

## Non-Goals

- Changing the system exercise detail page
- Modifying the shared components themselves
- Changing the backend API

## Success Criteria

- Custom exercise page looks identical to system page at first glance
- All fields are editable on the custom page
- Same shared components used on both pages
- No visual regressions on the system page
