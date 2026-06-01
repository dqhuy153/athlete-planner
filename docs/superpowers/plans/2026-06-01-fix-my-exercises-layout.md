# Fix My Exercises Header Button Layout

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa layout 3 nút "Nhập JSON", "AI Tạo Bài", "Bài tập mới" thành 1 hàng, xử lý overflow cho mobile.

**Architecture:** Flexbox với overflow handling, áp dụng pattern tương tự DayStatusBar.

**Tech Stack:** React 19, Tailwind CSS, lucide-react icons

---

### Task 1: Fix Button Layout in My Exercises Page

**Files:**
- Modify: `apps/web/app/[locale]/library/my/page.tsx` (lines 80-135)

- [ ] **Step 1: Wrap button group trong flex container**
  - Sửa div chứa 3 nút thành `flex flex-wrap gap-2` với `overflow-hidden`
  - Áp dụng `whitespace-nowrap` cho text trong nút

- [ ] **Step 2: Chạy TypeScript check**
```bash
pnpm --filter web exec tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**
```bash
git add apps/web/app/[locale]/library/my/page.tsx
git commit -m "fix: layout my exercises header buttons in single row with overflow handling"
```