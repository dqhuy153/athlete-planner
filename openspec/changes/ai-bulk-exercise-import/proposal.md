# Proposal: AI Bulk Exercise Import

## What

Change the AI exercise creation feature from generating **one exercise at a time** to generating **multiple exercises at once**, with the same duplicate detection and action flow as the existing Import JSON feature.

## Why

**Current problem:** Users must create exercises one-by-one via AI, which is tedious when they need to build a library of related exercises (e.g., "create a full push day workout" → 6+ exercises).

**Solution:** Let AI generate a batch of exercises in one prompt, then show a preview where users can choose to:
- **Clone** exercises that already exist in the admin master library (creates a private copy)
- **Override** exercises that already exist in their custom library (replaces existing)
- **Create** new exercises that don't match anything
- **Skip** any exercises they don't want

This mirrors the proven Import JSON flow that users already understand.

## Scope

### In scope
- AI generates array of exercises instead of single exercise
- Preview step with duplicate detection (admin master + custom exercises)
- Action selection per item (skip/clone/override/create)
- Bulk save via existing import endpoint

### Out of scope
- Changes to the admin import flow
- Changes to the Import JSON flow itself
- AI model/provider changes
- Tier system changes (PRO-only remains)

## Success Criteria
- User can type a prompt like "create a push day workout" and get 4-8 exercises
- Each exercise is checked against admin master and user's custom exercises
- User can choose action per exercise before saving
- All selected exercises are saved correctly
- Tier limits are enforced (FREE=10, PRO=unlimited)
