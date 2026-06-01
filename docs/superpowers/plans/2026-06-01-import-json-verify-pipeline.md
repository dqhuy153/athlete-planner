# Import JSON Verify Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PRO user import JSON exercises với verify pipeline, phân biệt admin existing, custom existing, new exercises.

**Architecture:** Modal với sport selector → preview với action selection → bulk apply. Backend xử lý classification qua dry-run API.

**Tech Stack:** React 19, Next.js 16, NestJS, Prisma, CQRS

---

### Task 1: Update FlatExerciseImportItem type

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add private exercise reference field**

- [ ] **Step 2: Chạy TypeScript check**

- [ ] **Step 3: Commit**

### Task 2: Add preview API function

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add preview function**

- [ ] **Step 2: Chạy TypeScript check**

- [ ] **Step 3: Commit**

### Task 3: Refactor ImportJSONModal with multi-step

**Files:**
- Modify: `apps/web/components/exercises/ImportJSONModal.tsx`

- [ ] **Step 1: Add step state và sport selector**

- [ ] **Step 2: Render sport selector step**

- [ ] **Step 3: Add preview step với action selection**

- [ ] **Step 4: Chạy TypeScript check**

- [ ] **Step 5: Commit**

### Task 4: Create Backend Preview Handler

**Files:**
- Create: `apps/api/modules/exercises/queries/preview-private-import.handler.ts`

- [ ] **Step 1: Implement handler**

- [ ] **Step 2: Chạy TypeScript check**

- [ ] **Step 3: Commit**

### Task 5: Register handlers

**Files:**
- Modify: `apps/api/modules/exercises/exercises.module.ts`

- [ ] **Step 1: Register PreviewPrivateImportHandler**

- [ ] **Step 2: Chạy TypeScript check**

- [ ] **Step 3: Commit**

### Task 6: Add i18n keys

**Files:**
- Modify: `apps/web/messages/vi.json` and `en.json`

- [ ] **Step 1: Add new keys**

- [ ] **Step 2: Chạy TypeScript check**

- [ ] **Step 3: Commit**