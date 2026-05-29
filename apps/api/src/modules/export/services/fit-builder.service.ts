import { Injectable } from '@nestjs/common';
import { Encoder, Profile } from '@garmin/fitsdk';
import type { Mesg } from '@garmin/fitsdk';
import type { DailySchedule, ScheduleItem, GymPayload, RunningPayload } from '@athlete-planner/contracts';
import { SportType, RunningIntensityType } from '@athlete-planner/contracts';

// Build reverse map: SCREAMING_SNAKE → FIT exerciseCategory string (camelCase)
function buildExerciseCategoryMap(): Map<string, string> {
  const ec = Profile.types.exerciseCategory as Record<string, string>;
  const map = new Map<string, string>();
  for (const [, camel] of Object.entries(ec)) {
    if (camel === 'invalid' || camel === 'unknown') continue;
    const snake = camel
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
    map.set(snake, camel);
    map.set(camel, camel);
  }
  return map;
}

const EXERCISE_CATEGORY_MAP = buildExerciseCategoryMap();

/** Cast a plain object to Mesg for encoder — SDK accepts string enum values at runtime */
function mesg(data: Record<string, unknown>): Mesg {
  return data as unknown as Mesg;
}

function garminEnumToFitCategory(garminEnum: string | null): string {
  if (!garminEnum) return 'unknown';
  return EXERCISE_CATEGORY_MAP.get(garminEnum) ?? 'unknown';
}

/** pace_seconds = seconds per 1 km; returns mm/s for FIT custom speed target */
function paceSecondsToMmPerSecond(paceSeconds: number): number {
  if (paceSeconds <= 0) return 0;
  return Math.round(1_000_000 / paceSeconds);
}

@Injectable()
export class FitBuilderService {
  buildRunningFit(
    schedule: DailySchedule,
    item: ScheduleItem,
    exerciseName: string,
  ): Uint8Array {
    const encoder = new Encoder();
    const now = new Date();

    encoder.onMesg(Profile.MesgNum.FILE_ID, mesg({
      type: 'workout',
      manufacturer: 'development',
      product: 0,
      timeCreated: now,
    }));

    const payload = item.runningPayload as RunningPayload | null;

    encoder.onMesg(Profile.MesgNum.WORKOUT, mesg({
      sport: 'running',
      numValidSteps: 1,
      wktName: exerciseName.slice(0, 16),
    }));

    let durationType: string;
    let durationValue: number;

    if (payload?.target_distance_km) {
      durationType = 'distance';
      durationValue = Math.round(payload.target_distance_km * 1000); // m
    } else if (payload?.duration_minutes) {
      durationType = 'time';
      durationValue = Math.round(payload.duration_minutes * 60 * 1000); // ms
    } else {
      durationType = 'open';
      durationValue = 0;
    }

    let targetType: string = 'open';
    let customTargetValueLow: number | undefined;
    let customTargetValueHigh: number | undefined;

    if (payload?.intensity_type === RunningIntensityType.PACE && payload.pace_target_range) {
      targetType = 'speed';
      customTargetValueLow = paceSecondsToMmPerSecond(payload.pace_target_range.slowest_pace_seconds);
      customTargetValueHigh = paceSecondsToMmPerSecond(payload.pace_target_range.fastest_pace_seconds);
    } else if (payload?.intensity_type === RunningIntensityType.HEART_RATE && payload.hr_target_range) {
      targetType = 'heartRate';
      if (payload.hr_target_range.zone) {
        encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, mesg({
          wktStepName: exerciseName.slice(0, 16),
          intensity: 'active',
          durationType,
          durationValue,
          targetType: 'heartRate',
          targetValue: payload.hr_target_range.zone,
          messageIndex: 0,
        }));
        return encoder.close();
      }
      customTargetValueLow = payload.hr_target_range.min_bpm ?? 0;
      customTargetValueHigh = payload.hr_target_range.max_bpm ?? 220;
    }

    const stepData: Record<string, unknown> = {
      wktStepName: exerciseName.slice(0, 16),
      intensity: 'active',
      durationType,
      durationValue,
      targetType,
      messageIndex: 0,
    };
    if (customTargetValueLow !== undefined) stepData.customTargetValueLow = customTargetValueLow;
    if (customTargetValueHigh !== undefined) stepData.customTargetValueHigh = customTargetValueHigh;

    encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, mesg(stepData));
    return encoder.close();
  }

  buildGymFit(
    schedule: DailySchedule,
    item: ScheduleItem,
    exerciseName: string,
    garminExerciseEnum: string | null,
  ): Uint8Array {
    const encoder = new Encoder();
    const now = new Date();

    const payload = item.gymPayload as GymPayload | null;
    const sets = payload?.sets ?? [];
    const restMs = (payload?.rest_time_seconds ?? 60) * 1000;
    const fitCategory = garminEnumToFitCategory(garminExerciseEnum);

    const numValidSteps = sets.length > 0 ? sets.length * 2 - 1 : 1;

    encoder.onMesg(Profile.MesgNum.FILE_ID, mesg({
      type: 'workout',
      manufacturer: 'development',
      product: 0,
      timeCreated: now,
    }));

    encoder.onMesg(Profile.MesgNum.WORKOUT, mesg({
      sport: 'training',
      numValidSteps,
      wktName: exerciseName.slice(0, 16),
    }));

    if (sets.length === 0) {
      encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, mesg({
        wktStepName: exerciseName.slice(0, 16),
        intensity: 'active',
        durationType: 'open',
        durationValue: 0,
        targetType: 'open',
        exerciseCategory: fitCategory,
        messageIndex: 0,
      }));
      return encoder.close();
    }

    let messageIndex = 0;
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      const weightRaw = Math.round((set.weight_kg ?? 0) * 100);

      encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, mesg({
        wktStepName: `Set ${set.set_number}`,
        intensity: 'active',
        durationType: 'reps',
        durationValue: set.reps,
        targetType: 'open',
        exerciseCategory: fitCategory,
        exerciseWeight: weightRaw,
        messageIndex: messageIndex++,
      }));

      if (i < sets.length - 1) {
        encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, mesg({
          wktStepName: 'Rest',
          intensity: 'rest',
          durationType: 'time',
          durationValue: restMs,
          targetType: 'open',
          messageIndex: messageIndex++,
        }));
      }
    }

    return encoder.close();
  }

  buildDayFits(
    schedule: DailySchedule,
    items: ScheduleItem[],
    exerciseNames: Map<string, string>,
    gymEnums: Map<string, string | null>,
  ): Array<{ filename: string; data: Uint8Array }> {
    return items.map((item, index) => {
      const name = exerciseNames.get(item.id) ?? `Exercise ${index + 1}`;
      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
      let data: Uint8Array;

      if (item.sportType === SportType.RUNNING) {
        data = this.buildRunningFit(schedule, item, name);
      } else {
        data = this.buildGymFit(schedule, item, name, gymEnums.get(item.id) ?? null);
      }

      return {
        filename: `${schedule.dateString}_${String(index + 1).padStart(2, '0')}_${safeName}.fit`,
        data,
      };
    });
  }
}
