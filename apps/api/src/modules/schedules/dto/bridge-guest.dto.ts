export class BridgeGuestScheduleDto {
  // ISO date string → array of schedule item data
  // May be empty ({}) if no guest data to bridge — handler is a no-op in that case
  scheduleData: Record<string, any[]>;
}
