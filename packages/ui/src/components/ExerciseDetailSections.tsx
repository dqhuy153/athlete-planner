'use client'

import { SportType } from '@athlete-planner/contracts'

const PHASE_ACCENT: Record<string, string> = {
  warm_up: 'bg-sky-500/15 text-sky-300',
  interval: 'bg-accent/15 text-accent',
  recovery: 'bg-emerald-500/15 text-emerald-300',
  steady_state: 'bg-cyan-500/15 text-cyan-300',
  cool_down: 'bg-violet-500/15 text-violet-300',
  custom: 'bg-gray-500/15 text-gray-300',
}

// ─── Helper components ───────────────────────────────────────────────────────

function DetailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`section-${title}`} className='mt-5'>
      <h3 className='mb-2 text-caption font-semibold uppercase tracking-wider text-text-tertiary'>
        {title}
      </h3>
      <div className='card-surface p-4'>{children}</div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className='flex gap-3 py-1'>
      <span className='text-caption text-text-tertiary shrink-0 w-32 uppercase tracking-wide'>
        {label}
      </span>
      <span
        className={`text-caption text-text-primary break-words flex-1 text-right ${mono ? 'font-data' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

function MetaChip({
  tone,
  children,
}: {
  tone: 'accent' | 'success' | 'neutral'
  children: React.ReactNode
}) {
  const cls =
    tone === 'accent'
      ? 'bg-accent-muted text-accent'
      : tone === 'success'
        ? 'bg-success/20 text-success'
        : 'bg-surface-3 text-text-secondary border border-border/60'
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-micro font-semibold tracking-wide uppercase ${cls}`}
    >
      {children}
    </span>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const secondsToPace = (sec: number | null | undefined) => {
  if (sec === null || sec === undefined) return null
  if (!Number.isFinite(sec) || sec <= 0) return null
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const getLocalizedName = (
  item: { name?: string; vietnameseName?: string } | null | undefined,
  locale: string,
): string => {
  if (!item) return ''
  const lang = locale.split('-')[0]
  if (lang === 'vi') {
    return item.vietnameseName?.trim() || item.name?.trim() || ''
  }
  return item.name?.trim() || item.vietnameseName?.trim() || ''
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExerciseDetailData {
  name?: string
  vietnameseName?: string
  sportType?: string
  targetMuscleGroup?: string
  secondaryMuscleGroups?: string[]
  runningType?: string
  classification?: string
  customNotes?: string
  instructions?: string[]
  gifUrl?: string
  youtubeEmbedUrl?: string
  mediaUrls?: string[]
  garminExerciseEnum?: string | null
  // Gym defaults
  defaultSets?: number
  defaultReps?: number
  defaultWeightKg?: number
  defaultRpe?: number
  restTimeSecs?: number
  restBetweenExercisesSecs?: number
  // Running defaults
  defaultTargetDistanceKm?: number
  defaultDurationMinutes?: number
  defaultIntensityType?: string
  defaultPaceMinSecPerKm?: number
  defaultPaceMaxSecPerKm?: number
  defaultHrZone?: number
  defaultHrMin?: number
  defaultHrMax?: number
  // Workout structure (running)
  workoutStructure?: Array<Record<string, unknown>>
}

/**
 * Translation function type - matches next-intl's useTranslations signature.
 * Uses any[] to accept variable arguments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateFn = (...args: any[]) => string

interface ExerciseDetailSectionsProps {
  data: ExerciseDetailData
  locale: string
  /** Translation functions passed from the consuming app */
  t: TranslateFn
  tField: TranslateFn
  tEnum: TranslateFn
  tUnit: TranslateFn
  tDyn: TranslateFn
  /** Optional reason/action text shown above sections */
  reasonKey?: string
  reasonText?: string
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ExerciseDetailSections({
  data,
  locale,
  t,
  tField,
  tEnum,
  tUnit,
  tDyn,
  reasonKey,
  reasonText,
}: ExerciseDetailSectionsProps) {
  const isRunning = data.sportType === SportType.RUNNING
  const localizedName = getLocalizedName(data, locale)
  const altName = isRunning
    ? getLocalizedName(
        { name: data.name, vietnameseName: data.vietnameseName },
        locale === 'vi' ? 'en' : 'vi',
      )
    : null

  return (
    <div className='space-y-1'>
      {/* Title + metadata chips */}
      <div>
        <h2 className='text-body font-semibold text-text-primary'>
          {localizedName}
        </h2>
        {altName && altName !== localizedName && (
          <p className='mt-0.5 text-caption text-text-tertiary'>{altName}</p>
        )}
      </div>

      {/* Metadata chips */}
      <div className='mt-4 flex flex-wrap gap-2'>
        {data.sportType && (
          <MetaChip tone={isRunning ? 'success' : 'accent'}>
            {tEnum(`sportType.${data.sportType}`)}
          </MetaChip>
        )}
        {!isRunning && data.targetMuscleGroup && (
          <MetaChip tone='neutral'>
            {tEnum(`muscleGroup.${data.targetMuscleGroup}`)}
          </MetaChip>
        )}
        {isRunning && data.runningType && (
          <MetaChip tone='neutral'>
            {tEnum(`runningType.${data.runningType}`)}
          </MetaChip>
        )}
        {data.classification && (
          <MetaChip tone='neutral'>{data.classification}</MetaChip>
        )}
        {data.secondaryMuscleGroups && data.secondaryMuscleGroups.length > 0 && (
          <MetaChip tone='neutral'>
            {data.secondaryMuscleGroups.join(', ')}
          </MetaChip>
        )}
        {data.garminExerciseEnum && (
          <MetaChip tone='neutral'>
            Garmin: {data.garminExerciseEnum}
          </MetaChip>
        )}
      </div>

      {/* Reason / action text */}
      {reasonText && (
        <p className='mt-4 text-caption text-text-secondary leading-relaxed'>
          {reasonText}
        </p>
      )}

      {/* Instructions */}
      {data.instructions && data.instructions.length > 0 && (
        <DetailSection title={t('sectionInstructions')}>
          <ol className='space-y-1.5' role='list'>
            {data.instructions.map((step, i) => (
              <li
                key={i}
                className='flex gap-2 text-caption text-text-primary'
              >
                <span className='font-data shrink-0 text-accent'>
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </DetailSection>
      )}

      {/* Notes */}
      {data.customNotes && data.customNotes.trim() && (
        <DetailSection title={t('sectionNotes')}>
          <p className='text-caption text-text-primary leading-relaxed whitespace-pre-wrap'>
            {data.customNotes}
          </p>
        </DetailSection>
      )}

      {/* Media */}
      {(data.gifUrl ||
        data.youtubeEmbedUrl ||
        (data.mediaUrls && data.mediaUrls.length > 0)) && (
        <DetailSection title={t('sectionMedia')}>
          <div className='space-y-1.5'>
            {data.gifUrl && (
              <DetailRow label={tField('gifUrl')} value={data.gifUrl} mono />
            )}
            {data.youtubeEmbedUrl && (
              <DetailRow
                label={tField('youtubeEmbedUrl')}
                value={data.youtubeEmbedUrl}
                mono
              />
            )}
            {data.mediaUrls && data.mediaUrls.length > 0 && (
              <DetailRow
                label={tField('mediaUrls')}
                value={data.mediaUrls.join(', ')}
                mono
              />
            )}
          </div>
        </DetailSection>
      )}

      {/* Defaults */}
      <DetailSection title={t('sectionDefaults')}>
        <div className='space-y-0'>
          {!isRunning ? (
            <>
              {data.defaultSets != null && (
                <DetailRow
                  label={tField('defaultSets')}
                  value={String(data.defaultSets)}
                  mono
                />
              )}
              {data.defaultReps != null && (
                <DetailRow
                  label={tField('defaultReps')}
                  value={String(data.defaultReps)}
                  mono
                />
              )}
              {data.defaultWeightKg != null && (
                <DetailRow
                  label={tField('defaultWeightKg')}
                  value={String(data.defaultWeightKg)}
                  mono
                />
              )}
              {data.defaultRpe != null && (
                <DetailRow
                  label={tField('defaultRpe')}
                  value={String(data.defaultRpe)}
                  mono
                />
              )}
              {data.restTimeSecs != null && (
                <DetailRow
                  label={tField('restTimeSecs')}
                  value={String(data.restTimeSecs)}
                  mono
                />
              )}
              {data.restBetweenExercisesSecs != null && (
                <DetailRow
                  label={tField('restBetweenExercisesSecs')}
                  value={String(data.restBetweenExercisesSecs)}
                  mono
                />
              )}
            </>
          ) : (
            <>
              {data.defaultTargetDistanceKm != null && (
                <DetailRow
                  label={tField('defaultTargetDistanceKm')}
                  value={tUnit('km', {
                    n: String(data.defaultTargetDistanceKm),
                  })}
                />
              )}
              {data.defaultDurationMinutes != null && (
                <DetailRow
                  label={tField('defaultDurationMinutes')}
                  value={tUnit('min', {
                    n: String(data.defaultDurationMinutes),
                  })}
                />
              )}
              {(() => {
                const minPace = secondsToPace(data.defaultPaceMinSecPerKm)
                const maxPace = secondsToPace(data.defaultPaceMaxSecPerKm)
                if (!minPace && !maxPace) return null
                return (
                  <>
                    {minPace && (
                      <DetailRow
                        label={tField('defaultPaceMinSecPerKm')}
                        value={tDyn('paceFormat', { pace: minPace })}
                      />
                    )}
                    {maxPace && (
                      <DetailRow
                        label={tField('defaultPaceMaxSecPerKm')}
                        value={tDyn('paceFormat', { pace: maxPace })}
                      />
                    )}
                  </>
                )
              })()}
              {data.defaultHrZone != null && (
                <DetailRow
                  label={tField('defaultHrZone')}
                  value={tDyn('hrZone', { n: String(data.defaultHrZone) })}
                />
              )}
              {data.defaultHrMin != null && (
                <DetailRow
                  label={tField('defaultHrMin')}
                  value={tUnit('bpm', { n: String(data.defaultHrMin) })}
                />
              )}
              {data.defaultHrMax != null && (
                <DetailRow
                  label={tField('defaultHrMax')}
                  value={tUnit('bpm', { n: String(data.defaultHrMax) })}
                />
              )}
            </>
          )}
        </div>
      </DetailSection>

      {/* Workout structure — running only */}
      {isRunning &&
        data.workoutStructure &&
        data.workoutStructure.length > 0 && (
          <DetailSection title={t('sectionStructure')}>
            <div className='space-y-2'>
              {data.workoutStructure.map((phase, i) => {
                const p = phase as Record<string, unknown>
                const typeStr = p.type != null ? String(p.type) : 'custom'
                const phaseClass =
                  PHASE_ACCENT[typeStr] ?? PHASE_ACCENT.custom
                return (
                  <div
                    key={i}
                    className='card-surface flex items-center gap-3 px-4 py-3'
                  >
                    <span className='font-data text-subheading font-bold text-accent'>
                      {i + 1}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <p className='text-caption font-medium text-text-primary truncate'>
                        {p.phase != null
                          ? String(p.phase)
                          : `${t('sectionStructure')} ${i + 1}`}
                      </p>
                      <div className='mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-micro text-text-secondary font-data'>
                        {p.duration_minutes != null && (
                          <span>{String(p.duration_minutes)} min</span>
                        )}
                        {p.distance_meters != null && (
                          <span>{String(p.distance_meters)} m</span>
                        )}
                        {p.hr_zone != null && (
                          <span>Z{String(p.hr_zone)}</span>
                        )}
                        {p.pace_min_per_km != null && (
                          <span>{String(p.pace_min_per_km)} min/km</span>
                        )}
                        {p.pace_max_per_km != null && (
                          <span>{String(p.pace_max_per_km)} min/km</span>
                        )}
                        {p.cadence != null && (
                          <span>{String(p.cadence)} spm</span>
                        )}
                        {p.rpe != null && (
                          <span>RPE {String(p.rpe)}</span>
                        )}
                        {p.repeat_count != null && (
                          <span>×{String(p.repeat_count)}</span>
                        )}
                      </div>
                      {p.type != null && (
                        <span
                          className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${phaseClass}`}
                        >
                          {tEnum(`phaseType.${typeStr}`)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </DetailSection>
        )}
    </div>
  )
}
