# Vibe Coding Harness - Quy Trình Vibing với Opencode CLI

## Quy Tắc BẮT BUỘC (LUÔN TUẦN THỦ)

### Bước 1: Kích Hoạt Skills (LUÔN LÀ BƯỚC ĐẦU TIÊN)
- Trước khi làm bất kỳ task nào, **phải** gọi `skill` tool
- Thư mục skills: `.agents/skills/`
- Skills xử lý quy trình: `brainstorming`, `systematic-debugging`, `test-driven-development`
- Skills pattern: `nestjs-best-practices`, `tailwind-design-system`, `zustand`, `react-hook-form-zod`, `prisma-client-api`

### Bước 2: Khám Phá (Dùng `task` tool)
- Dùng subagent `explore` để tìm files, patterns, conventions
- Tìm components reusable trong `packages/ui/src/` và `apps/*/components/`
- Đọc `docs/MEMORY.md` để hiểu context kiến trúc
- Đọc `AGENTS.md` để biết rules dự án

### Bước 3: Quy Tắc Implement
- **Reuse trước**: Kiểm tra components đã có trước khi tạo mới
- Tạo component mới → kiểm tra `packages/ui/src/` structure trước
- Đặt tên: PascalCase cho components
- Dùng Tailwind tokens: `bg-surface-*`, `text-text-*`, `border-*`, `accent-*`
- Icons: Chỉ dùng `lucide-react`, không dùng emoji

### Bước 4: Hoàn Thành
- Chạy TypeScript check: `pnpm --filter <app> exec tsc --noEmit`
- Cập nhật `docs/MEMORY.md` với thay đổi
- Cập nhật i18n files nếu có thay đổi text UI

## Skill Matching - Bảng Tham Khảo

| Loại Task | Skills Cần Dùng |
|-----------|-----------------|
| UI Components | `minimalist-ui`, `tailwind-design-system`, `design-taste-frontend` |
| NestJS Backend | `nestjs-best-practices` |
| Forms/Validation | `react-hook-form-zod` |
| State Management | `zustand` |
| Database Queries | `prisma-client-api`, `prisma-cli` |
| Tính năng mới | `brainstorming`, `writing-plans` |
| Bug/Lỗi | `systematic-debugging` |
| i18n | `readme-i18n` |

## Lưu Ý Quan Trọng

1. **Nếu có bất kỳ khi nào skill có thể áp dụng (kể cả 1%) - PHẢI dùng skill**
2. Skills quy trình (brainstorming, debugging) ưu tiên hơn skills implement
3. "Sáng tạo" hoặc "thêm tính năng" → dùng `brainstorming` trước
4. "Sửa lỗi" → dùng `systematic-debugging` trước