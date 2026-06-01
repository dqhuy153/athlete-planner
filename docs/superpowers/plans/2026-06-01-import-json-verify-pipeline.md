# Import JSON Verify Pipeline for PRO Users

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép PRO user import JSON bài tập với verify pipeline tương tự admin, xử lý 3 loại exercises (admin existing, custom existing, new).

**Architecture:** Modal import JSON mới với download skill prompt, dry-run preview, multi-action selection, bulk apply.

**Tech Stack:** React 19, Next.js 16, Prisma, CQRS, next-intl

---

### Task 1: Add Download Skill Prompt Feature

**Files:**
- Modify: `apps/web/components/exercises/ImportJSONModal.tsx`

- [ ] **Step 1: Add download button và skill prompt URLs**
```typescript
// Trong ImportJSONModal
const GYM_SKILL_URL = '/skills/gym-exercise-import.md'
const RUNNING_SKILL_URL = '/skills/running-exercise-import.md'

// Thêm nút download trước drop zone
<a href={isGym ? GYM_SKILL_URL : RUNNING_SKILL_URL} download className="text-xs text-accent underline">
  Download skill prompt
</a>
```

### Task 2: Add Exercise Type Detection

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add endpoint check exercise exists**
```typescript
// Thêm function kiểm tra exercise đã tồn tại
async checkExerciseExists(token: string, name: string, sportType: 'GYM' | 'RUNNING') {
  const res = await this.request(`/exercises/check-exists?name=${encodeURIComponent(name)}&sportType=${sportType}`, { token })
  return res.json()
}
```

### Task 3: Update Modal with Verify Preview

**Files:**
- Modify: `apps/web/components/exercises/ImportJSONModal.tsx`
- Add: Preview state cho 3 loại exercises

- [ ] **Step 1: Thêm state cho preview data**
```typescript
const [previewData, setPreviewData] = useState<PreviewItem[]>([])
const [selectedActions, setSelectedActions] = useState<Record<number, string>>({})
```

- [ ] **Step 2: Gọi dry-run API sau khi parse JSON**
```typescript
// Sau khi parse JSON, gọi POST /exercises/private/import?dryRun=true
const preview = await api.previewPrivateExercises(token, items)
setPreviewData(formatPreview(preview))
```

### Task 4: Render Preview Table with Actions

**Files:**
- Modify: `apps/web/components/exercises/ImportJSONModal.tsx`

- [ ] **Step 1: Hiển thị bảng preview với action select**
```typescript
// Status badge cho mỗi loại
// - admin: DUPLICATE (skip/clone)
// - custom: DUPLICATE (skip/override)  
// - new: NEW (skip/create)

// Dropdown action cho mỗi row
<select onChange={(e) => setSelectedActions({...selectedActions, [i]: e.target.value})}>
  <option value="skip">Skip</option>
  <option value="clone">Clone</option>
  <option value="override">Override</option>
  <option value="create">Create</option>
</select>
```

### Task 5: Bulk Save All Selections

**Files:**
- Modify: `apps/web/components/exercises/ImportJSONModal.tsx`

- [ ] **Step 1: Thêm nút Save All và xử lý bulk create**
```typescript
// Khi click Save All, gom tất cả selections
// POST /exercises/private/import?dryRun=false với actions array
```

### Task 6: Update API

**Files:**
- Create: `apps/api/modules/exercises/commands/import-private-exercises.handler.ts`
- Create: `apps/api/modules/exercises/queries/check-exercise-exists.handler.ts`

- [ ] **Step 1: Tạo handler mới cho private exercise import**
- [ ] **Step 2: Register handlers trong exercises.module.ts