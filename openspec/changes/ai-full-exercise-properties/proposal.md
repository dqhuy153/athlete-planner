# Proposal: AI Full Exercise Properties

## What

Upgrade the AI exercise generation to produce **full exercise properties** (matching Import JSON), support **user locale** for output language, and **extract shared components** so both AI and Import JSON flows use identical UI.

## Why

**Current problem:**
- AI generates only 6 fields (name, sportType, classification, notes, instructions)
- Import JSON provides 22+ fields (media, gym defaults, running defaults, workout structure)
- Users must manually add workout defaults after AI generation — extra friction
- AI modal and Import JSON modal have different UIs — inconsistent UX
- `ExerciseDetailSections` component is duplicated in ImportJSONModal — violates DRY

**Solution:**
- AI generates all inferable fields (workout defaults like sets/reps/distance/duration)
- AI outputs in user's locale (Vietnamese or English)
- Extract `ExerciseDetailSections` to shared package
- Both AI and Import JSON modals use the same shared component for detail preview
- Consistent UI = better UX, less code to maintain

## Scope

### In scope
- Update AI system prompt to generate all inferable fields
- Pass locale from FE to AI endpoint
- Update `DraftExercise` type to include workout defaults
- Extract `ExerciseDetailSections` to `packages/ui/`
- Refactor AI modal to reuse shared component
- Add AGENTS.md rules about shared components

### Out of scope
- Media URL generation (AI can't generate real URLs)
- Workout structure phase generation (too complex for AI to infer reliably)
- Changes to the Import JSON flow itself
- Changes to the admin import flow

## Success Criteria
- AI generates exercises with workout defaults (sets/reps/distance/duration)
- AI outputs exercise names and instructions in user's locale
- Both AI and Import JSON modals show identical detail views
- No duplicated `ExerciseDetailSections` code
- AGENTS.md updated with shared component policy
