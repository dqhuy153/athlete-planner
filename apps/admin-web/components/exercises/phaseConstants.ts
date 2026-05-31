// TODO: design token needed — these colors are used as dynamic JS style values (style={{ color }})
// and cannot be replaced with Tailwind classes. #22C55E=success, #EF4444=error, #F59E0B=warning;
// #3B82F6 (blue) and #6B7280 (gray) have no token in MA design system.
export const PHASE_TYPES = [
  { value: 'warm_up', label: 'Warm-up', color: '#22C55E' },
  { value: 'interval', label: 'Interval', color: '#EF4444' },
  { value: 'recovery', label: 'Recovery', color: '#F59E0B' },
  { value: 'steady_state', label: 'Steady State', color: '#3B82F6' },
  { value: 'cool_down', label: 'Cool-down', color: '#22C55E' },
  { value: 'custom', label: 'Custom', color: '#6B7280' },
] as const;

export function getPhaseColor(type: string): string {
  return PHASE_TYPES.find((t) => t.value === type)?.color ?? '#6B7280'; // TODO: design token needed
}
