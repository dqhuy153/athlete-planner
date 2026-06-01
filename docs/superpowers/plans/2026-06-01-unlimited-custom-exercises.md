# Unlimited Custom Exercises for PRO Users

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PRO user có thể tạo không giới hạn bài tập cá nhân, FREE user vẫn giới hạn 10.

**Architecture:** Kiểm tra tier trước khi giới hạn, trả về lỗi LIMIT_REACHED_FREE_TIER cho FREE user vượt quá 10.

**Tech Stack:** NestJS, Prisma, CQRS

---

### Task 1: Update Tier Guard Logic

**Files:**
- Modify: `apps/api/modules/tier-guard/tier-guard.service.ts` (hoặc tạo nếu chưa có)
- Modify: `apps/api/modules/exercises/exercises.controller.ts`

- [ ] **Step 1: Check tier trước khi giới hạn private exercises**
```typescript
// Trong exercises.controller hoặc service
async createPrivateExercise(userId: string, data: any) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } })
  const existingCount = await this.prisma.privateExercise.count({ where: { userId } })
  
  if (user?.tier === 'FREE' && existingCount >= 10) {
    throw new ConflictException('LIMIT_REACHED_FREE_TIER')
  }
  // proceed with creation
}
```

- [ ] **Step 2: Chạy TypeScript check**
```bash
pnpm --filter api exec tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add apps/api/modules/exercises/exercises.controller.ts
git commit -m "feat: unlimited private exercises for PRO tier"
```