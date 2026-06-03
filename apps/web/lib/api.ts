import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
  DailySchedule,
  ScheduleItem,
  GymPayload,
  RunningPayload,
  BlogPost,
  BlogCategory,
  User,
  DraftExercise,
} from '@athlete-planner/contracts'
import {
  SportType,
  ExerciseSourceType,
  ExperienceLevel,
} from '@athlete-planner/contracts'

export type { DraftExercise }
export { SportType }

export type WorkoutDraftDay = DraftExercise[]

export interface WorkoutDraftWeek {
  monday: DraftExercise[] | null
  tuesday: DraftExercise[] | null
  wednesday: DraftExercise[] | null
  thursday: DraftExercise[] | null
  friday: DraftExercise[] | null
  saturday: DraftExercise[] | null
  sunday: DraftExercise[] | null
}

export interface FlatExerciseImportItem {
  name: string
  sportType: SportType
  targetMuscleGroup?: string
  runningType?: string
  customNotes?: string
  gifUrl?: string
  youtubeEmbedUrl?: string
  mediaUrls?: string[]
  instructions?: string[]
  workoutStructure?: object[]
  defaultSets?: number
  defaultReps?: number
  defaultWeightKg?: number
  defaultRpe?: number
  restTimeSecs?: number
  restBetweenExercisesSecs?: number
  defaultTargetDistanceKm?: number
  defaultDurationMinutes?: number
  defaultIntensityType?: 'PACE' | 'HEART_RATE' | 'NONE'
  defaultPaceMinSecPerKm?: number
  defaultPaceMaxSecPerKm?: number
  defaultHrZone?: number
  defaultHrMin?: number
  defaultHrMax?: number
  vietnameseName?: string
  secondaryMuscleGroups?: string[]
  garminExerciseEnum?: string
}

export interface PrivateImportPreviewItem {
  index: number
  name: string
  sportType: SportType
  status: 'admin-existing' | 'custom-existing' | 'new'
  existingId?: string
  adminExerciseId?: string
  customExerciseId?: string
  data?: FlatExerciseImportItem
  action?: 'skip' | 'clone' | 'override' | 'create'
}

export interface PrivateImportPreviewResponse {
  results: PrivateImportPreviewItem[]
  summary: { admin: number; custom: number; new: number }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const DEFAULT_TIMEOUT_MS = 15_000

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    path: string,
    options?: RequestInit & { timeoutMs?: number },
  ): Promise<T> {
    const url = `${this.baseUrl}/api${path}`
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS

    // Per-request abort with a configurable ceiling. iOS Safari PWA reloads
    // can stall on hung TCP connections for the full 30s kernel default —
    // the 15s default surfaces those failures faster. AI endpoints override
    // with a longer timeout because free-tier providers (OpenRouter) often
    // queue and take 30–90s to respond.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    let res: Response
    try {
      res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...options?.headers },
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      const text = await res.text()
      try {
        const err = JSON.parse(text)
        throw new Error(err.message || text)
      } catch (e) {
        if (e instanceof Error && e.message !== text) throw e
        throw new Error(text || `HTTP ${res.status}`)
      }
    }
    return res.json() as Promise<T>
  }

  private authHeaders(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  getMe(accessToken: string) {
    return this.request<{ userId: string; email: string; role: string }>(
      '/auth/me',
      {
        headers: this.authHeaders(accessToken),
      },
    )
  }

  // ── Users ────────────────────────────────────────────────────────────────
  getProfile(accessToken: string) {
    return this.request<User>('/users/profile', {
      headers: this.authHeaders(accessToken),
    })
  }

  updateProfile(
    accessToken: string,
    data: { name?: string; avatarUrl?: string },
  ) {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(data),
    })
  }

  updatePreferredLevel(
    accessToken: string,
    userId: string,
    preferredLevel: ExperienceLevel | null,
  ) {
    return this.request<User>(`/users/${userId}/profile`, {
      method: 'PUT',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify({ preferredLevel }),
    })
  }

  updateOnboardingProfile(
    accessToken: string,
    userId: string,
    data: {
      preferredLevel: string
      referenceWeightKg?: number
      referencePaceMinPerKm?: number
    },
  ) {
    return this.request<User>(`/users/${userId}/profile`, {
      method: 'PUT',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(data),
    })
  }

  // ── Blog ─────────────────────────────────────────────────────────────────
  getBlogPosts(params?: {
    page?: number
    limit?: number
    categoryKey?: string
  }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.categoryKey) query.set('categoryKey', params.categoryKey)
    return this.request<{
      posts: BlogPost[]
      total: number
      page: number
      limit: number
    }>(`/blog?${query}`)
  }

  getBlogPostBySlug(slug: string) {
    return this.request<BlogPost>(`/blog/${slug}`)
  }

  getBlogCategories() {
    return this.request<BlogCategory[]>('/blog/categories')
  }

  // ── Exercises ────────────────────────────────────────────────────────────

  getGymExercises(params?: { muscleGroup?: string; search?: string }) {
    const qs = new URLSearchParams()
    if (params?.muscleGroup) qs.set('muscleGroup', params.muscleGroup)
    if (params?.search) qs.set('search', params.search)
    const q = qs.toString()
    return this.request<GymExerciseMaster[]>(
      `/exercises/gym${q ? `?${q}` : ''}`,
    )
  }

  getRunningExercises(params?: { runningType?: string; search?: string }) {
    const qs = new URLSearchParams()
    if (params?.runningType) qs.set('runningType', params.runningType)
    if (params?.search) qs.set('search', params.search)
    const q = qs.toString()
    return this.request<RunningExerciseMaster[]>(
      `/exercises/running${q ? `?${q}` : ''}`,
    )
  }

  getExerciseDetail(id: string) {
    return this.request<
      GymExerciseMaster | RunningExerciseMaster | PrivateExercise
    >(`/exercises/${id}`)
  }

  getPrivateExercises(token: string) {
    return this.request<PrivateExercise[]>('/exercises/private', {
      headers: this.authHeaders(token),
    })
  }

  createPrivateExercise(
    token: string,
    data: {
      sportType: SportType
      name: string
      targetMuscleGroup?: string
      runningType?: string
      customNotes?: string
      gifUrl?: string
      mediaUrls?: string[]
      sourceGymMasterId?: string
      youtubeEmbedUrl?: string
      instructions?: string[]
      workoutStructure?: object[]
      defaultSets?: number
      defaultReps?: number
      defaultWeightKg?: number
      defaultRpe?: number
      restTimeSecs?: number
      restBetweenExercisesSecs?: number
      defaultTargetDistanceKm?: number
      defaultDurationMinutes?: number
      defaultIntensityType?: string
      defaultPaceMinSecPerKm?: number
      defaultPaceMaxSecPerKm?: number
      defaultHrZone?: number
      defaultHrMin?: number
      defaultHrMax?: number
    },
  ) {
    return this.request<PrivateExercise>('/exercises/private', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    })
  }

  updatePrivateExercise(
    token: string,
    id: string,
    data: Partial<{
      name: string
      customNotes: string
      gifUrl: string
      targetMuscleGroup: string
      runningType: string
      mediaUrls: string[]
      instructions: string[]
      youtubeEmbedUrl: string
    }>,
  ) {
    return this.request<PrivateExercise>(`/exercises/private/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    })
  }

  togglePrivateExercise(token: string, id: string) {
    return this.request<PrivateExercise>(`/exercises/private/${id}/toggle`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    })
  }

  getPrivateExercise(token: string, id: string) {
    return this.request<PrivateExercise>(`/exercises/private/${id}`, {
      headers: this.authHeaders(token),
    })
  }

  updatePrivateExerciseConfig(
    token: string,
    id: string,
    data: {
      type: 'GYM' | 'RUNNING'
      gym?: {
        defaultSets?: number | null
        defaultReps?: number | null
        defaultWeightKg?: number | null
        defaultRpe?: number | null
        restTimeSecs?: number | null
        restBetweenExercisesSecs?: number | null
      }
      running?: {
        defaultTargetDistanceKm?: number | null
        defaultDurationMinutes?: number | null
        defaultIntensityType?: string | null
        defaultPaceMinSecPerKm?: number | null
        defaultPaceMaxSecPerKm?: number | null
        defaultHrZone?: number | null
        defaultHrMin?: number | null
        defaultHrMax?: number | null
      }
    },
  ) {
    return this.request<PrivateExercise>(`/exercises/private/${id}/config`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    })
  }

  deletePrivateExercise(token: string, id: string) {
    return this.request<void>(`/exercises/private/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    })
  }

  previewPrivateExercises(
    token: string,
    exercises: FlatExerciseImportItem[],
  ): Promise<PrivateImportPreviewResponse> {
    return this.request<PrivateImportPreviewResponse>(
      '/exercises/private/preview',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify({ exercises }),
      },
    )
  }

  importPrivateExercises(
    token: string,
    items: PrivateImportPreviewItem[],
  ): Promise<{ imported: number; skipped: number }> {
    const exercises = items
      .filter(p => p.action !== 'skip')
      .map(p => {
        if (p.data) return p.data
        return { name: p.name, sportType: p.sportType }
      })
    return this.request<{ imported: number; skipped: number }>(
      '/exercises/private/import',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify({ exercises }),
      },
    )
  }

  // ── Schedules ────────────────────────────────────────────────────────────

  getWeekSchedule(token: string, year: number, weekNumber: number) {
    return this.request<DailySchedule[]>(
      `/schedules/week/${year}/${weekNumber}`,
      { headers: this.authHeaders(token) },
    )
  }

  async getDailySchedule(token: string, dateString: string) {
    try {
      return await this.request<DailySchedule>(`/schedules/day/${dateString}`, {
        headers: this.authHeaders(token),
      })
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes('404') ||
          err.message.includes('not found') ||
          err.message.includes('Not found'))
      )
        return null
      throw err
    }
  }

  createDailySchedule(token: string, dateString: string) {
    return this.request<DailySchedule>('/schedules/day', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ dateString }),
    })
  }

  async getOrCreateDailySchedule(
    token: string,
    dateString: string,
  ): Promise<DailySchedule> {
    try {
      const existing = await this.getDailySchedule(token, dateString)
      if (existing) return existing
    } catch {
      // not found — create below
    }
    return this.createDailySchedule(token, dateString)
  }

  updateDayStatus(token: string, scheduleId: string, status: string) {
    return this.request<DailySchedule>(`/schedules/day/${scheduleId}/status`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ status }),
    })
  }

  addScheduleItem(
    token: string,
    scheduleId: string,
    data: {
      exerciseType: ExerciseSourceType
      exerciseId: string
      sportType: SportType
      gymPayload?: Partial<GymPayload>
      runningPayload?: Partial<RunningPayload>
    },
  ) {
    return this.request<ScheduleItem>(`/schedules/day/${scheduleId}/items`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    })
  }

  removeScheduleItem(token: string, itemId: string) {
    return this.request<{ deleted: boolean }>(`/schedules/items/${itemId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    })
  }

  reorderScheduleItems(token: string, scheduleId: string, itemIds: string[]) {
    return this.request<DailySchedule>(`/schedules/day/${scheduleId}/reorder`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ itemIds }),
    })
  }

  updateGymPayload(token: string, itemId: string, payload: GymPayload) {
    return this.request<ScheduleItem>(
      `/schedules/items/${itemId}/gym-payload`,
      {
        method: 'PATCH',
        headers: this.authHeaders(token),
        body: JSON.stringify({ payload }),
      },
    )
  }

  updateRunningPayload(token: string, itemId: string, payload: RunningPayload) {
    return this.request<ScheduleItem>(
      `/schedules/items/${itemId}/running-payload`,
      {
        method: 'PATCH',
        headers: this.authHeaders(token),
        body: JSON.stringify({ payload }),
      },
    )
  }

  getDisciplineRate(token: string, year: number, weekNumber: number) {
    return this.request<{
      rate: number
      completedDays: number
      totalDays: number
    }>(`/schedules/discipline-rate/${year}/${weekNumber}`, {
      headers: this.authHeaders(token),
    })
  }

  copyDay(
    token: string,
    sourceDateString: string,
    targetDateString: string,
    overwrite: boolean,
  ) {
    return this.request<{
      copied: number
      skipped: boolean
      targetScheduleId?: string
    }>('/schedules/copy-day', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ sourceDateString, targetDateString, overwrite }),
    })
  }

  copyWeek(
    token: string,
    sourceWeekNumber: number,
    sourceYear: number,
    targetWeekNumber: number,
    targetYear: number,
    overwrite: boolean,
  ) {
    return this.request<{
      totalCopied: number
      daysProcessed: number
      daysSkipped: number
    }>('/schedules/copy-week', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({
        sourceWeek: sourceWeekNumber,
        sourceYear,
        targetWeek: targetWeekNumber,
        targetYear,
        overwrite,
      }),
    })
  }

  shiftScheduleToTomorrow(
    token: string,
    dateString: string,
  ): Promise<{ shifted: number }> {
    return this.request<{ shifted: number }>('/schedules/shift-day', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ dateString }),
    })
  }
  // ─── Payments ───────────────────────────────────────────────────────────────

  async createPaymentLink(
    token: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<{ checkoutUrl: string }> {
    return this.request<{ checkoutUrl: string }>('/payments/create-link', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ returnUrl, cancelUrl }),
    })
  }

  // ─── Guest Bridge ─────────────────────────────────────────────────────────────

  bridgeGuestSchedule(
    token: string,
    scheduleData: Record<string, any[]> = {},
  ): Promise<{ bridged: boolean }> {
    return this.request<{ bridged: boolean }>('/schedules/bridge-guest', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ scheduleData }),
    })
  }

  // ─── Export ─────────────────────────────────────────────────────────────────

  /**
   * Download day FIT (or ZIP if multiple items).
   * Returns a Blob for browser download.
   */
  async exportDayFit(
    dateString: string,
    token: string,
  ): Promise<{ blob: Blob; filename: string }> {
    const res = await fetch(`${this.baseUrl}/api/export/day/${dateString}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Export failed')
    const disposition = res.headers.get('content-disposition') ?? ''
    const match = disposition.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? `${dateString}.fit`
    const blob = await res.blob()
    return { blob, filename }
  }

  /**
   * Download week ZIP of FIT files.
   */
  async exportWeekZip(
    year: number,
    weekNumber: number,
    token: string,
  ): Promise<{ blob: Blob; filename: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/export/week/${year}/${weekNumber}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    if (!res.ok) throw new Error('Export failed')
    const disposition = res.headers.get('content-disposition') ?? ''
    const match = disposition.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? `week_${year}_W${weekNumber}.zip`
    const blob = await res.blob()
    return { blob, filename }
  }

  // ─── AI ─────────────────────────────────────────────────────────────────────
  // AI endpoints use a 90s client timeout (vs 15s default) because the free
  // model (meta-llama/llama-3.3-70b-instruct:free on OpenRouter) frequently
  // queues and takes 30–90s to respond.

  private static readonly AI_TIMEOUT_MS = 90_000

  generateWorkout(
    token: string,
    prompt: string,
    mode: 'day' | 'week',
  ): Promise<WorkoutDraftDay | WorkoutDraftWeek> {
    return this.request<WorkoutDraftDay | WorkoutDraftWeek>(
      '/ai/generate-workout',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify({ prompt, mode }),
        timeoutMs: ApiClient.AI_TIMEOUT_MS,
      },
    )
  }

  createExerciseAI(token: string, prompt: string): Promise<DraftExercise> {
    return this.request<DraftExercise>('/ai/create-exercise', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ prompt }),
      timeoutMs: ApiClient.AI_TIMEOUT_MS,
    })
  }

  createExercisesBulkAI(
    token: string,
    prompt: string,
    locale: string,
  ): Promise<{ exercises: DraftExercise[] }> {
    return this.request<{ exercises: DraftExercise[] }>(
      '/ai/create-exercises',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify({ prompt, locale }),
        timeoutMs: ApiClient.AI_TIMEOUT_MS,
      },
    )
  }

  suggestAlternative(
    token: string,
    currentExerciseName: string,
    reason: string,
  ): Promise<DraftExercise> {
    return this.request<DraftExercise>('/ai/exercise-alternative', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ currentExerciseName, reason }),
      timeoutMs: ApiClient.AI_TIMEOUT_MS,
    })
  }

  bulkCreatePrivateExercises(
    token: string,
    exercises: FlatExerciseImportItem[],
  ): Promise<{ created: number; errors: string[] }> {
    return this.request<{ created: number; errors: string[] }>(
      '/exercises/private/bulk',
      {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify({ exercises }),
      },
    )
  }
}

const VALID_MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const
const VALID_RUNNING_TYPES = ['Interval', 'Easy', 'Tempo', 'Long_Run'] as const

const MUSCLE_GROUP_MAP: Record<string, typeof VALID_MUSCLE_GROUPS[number]> = {
  chest: 'Chest', pectoral: 'Chest', pecs: 'Chest', breast: 'Chest',
  back: 'Back', lats: 'Back', lat: 'Back', traps: 'Back', rear: 'Back',
  shoulder: 'Shoulders', deltoid: 'Shoulders', delts: 'Shoulders',
  arm: 'Arms', bicep: 'Arms', biceps: 'Arms', tricep: 'Arms', triceps: 'Arms', forearms: 'Arms', forearm: 'Arms',
  leg: 'Legs', quad: 'Legs', quads: 'Legs', hamstring: 'Legs', hamstrings: 'Legs', calf: 'Legs', calves: 'Legs', glute: 'Legs', glutes: 'Legs',
  abs: 'Abs', core: 'Abs', abdominal: 'Abs', abdominals: 'Abs', oblique: 'Abs', obliques: 'Abs',
}

const RUNNING_TYPE_MAP: Record<string, typeof VALID_RUNNING_TYPES[number]> = {
  interval: 'Interval', intervals: 'Interval', hiit: 'Interval', sprint: 'Interval', sprints: 'Interval',
  easy: 'Easy', recovery: 'Easy', easyrun: 'Easy', easy_run: 'Easy', jog: 'Easy', jogging: 'Easy',
  tempo: 'Tempo', threshold: 'Tempo', tempo_run: 'Tempo',
  long: 'Long_Run', longrun: 'Long_Run', long_run: 'Long_Run', endurance: 'Long_Run', lsd: 'Long_Run',
}

export function normalizeMuscleGroup(value?: string): typeof VALID_MUSCLE_GROUPS[number] | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if ((VALID_MUSCLE_GROUPS as readonly string[]).includes(trimmed)) return trimmed as typeof VALID_MUSCLE_GROUPS[number]
  const lower = trimmed.toLowerCase()
  if (MUSCLE_GROUP_MAP[lower]) return MUSCLE_GROUP_MAP[lower]
  for (const [key, val] of Object.entries(MUSCLE_GROUP_MAP)) {
    if (lower.includes(key)) return val
  }
  return undefined
}

export function normalizeRunningType(value?: string): typeof VALID_RUNNING_TYPES[number] | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if ((VALID_RUNNING_TYPES as readonly string[]).includes(trimmed)) return trimmed as typeof VALID_RUNNING_TYPES[number]
  const lower = trimmed.toLowerCase().replace(/[\s-]/g, '')
  if (RUNNING_TYPE_MAP[lower]) return RUNNING_TYPE_MAP[lower]
  for (const [key, val] of Object.entries(RUNNING_TYPE_MAP)) {
    if (lower.includes(key)) return val
  }
  return undefined
}

export function normalizeDraftExercise(exercise: DraftExercise): DraftExercise {
  return {
    ...exercise,
    targetMuscleGroup: normalizeMuscleGroup(exercise.targetMuscleGroup),
    runningType: normalizeRunningType(exercise.runningType),
  }
}

export const api = new ApiClient(API_URL)
