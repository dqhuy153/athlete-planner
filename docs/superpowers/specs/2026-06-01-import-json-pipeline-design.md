# Import JSON Verify Pipeline - Design

## Yêu cầu
PRO user import JSON exercises với verify pipeline, hỗ trợ cả GYM và RUNNING.

## Flow mới

```
Modal Header
↓
Sport Selector (GYM | RUNNING) → xác định loại import
↓
Skill Prompt Download Link (dựa trên sport đã chọn)
↓
Drop Zone (upload JSON file hoặc paste text)
↓
Preview Table với action selection:
  - Admin existing: SKIP | CLONE (tạo bản sao cá nhân)
  - Custom existing: SKIP | OVERRIDE  
  - New: SKIP | CREATE
↓
Save All button → apply tất cả selections
```

## Kiến trúc

**`SPORT_CONFIG` pattern** (scaleable):
```typescript
const SPORT_CONFIG: Record<SportType, {
  skillUrl: string;
  options: string[];
  optionField: keyof FlatExerciseImportItem;
  placeholderKey: string;
}> = {
  [SportType.GYM]: { /* ... */ },
  [SportType.RUNNING]: { /* ... */ },
}
```

**States trong modal:**
```typescript
type ImportStep = 'select-sport' | 'upload' | 'preview';
const [step, setStep] = useState<ImportStep>('select-sport');
const [selectedSport, setSelectedSport] = useState<SportType>(SportType.GYM);
const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
const [selectedActions, setSelectedActions] = useState<Record<number, 'skip' | 'clone' | 'override' | 'create'>>({});
```

**Backend API cần tạo:**
- `POST /exercises/private/import?dryRun=true` - validate + classify
- Response: `{ results: [{ status: 'admin'|'custom'|'new', ... }], summary: {...} }`

## Components cần modify
- `apps/web/components/exercises/ImportJSONModal.tsx` - thêm sport selector + verify pipeline
- `apps/api/modules/exercises/queries/preview-private-import.handler.ts` - mới
- `apps/api/modules/exercises/commands/import-private-exercises.handler.ts` - mới (bulk create với action)