export class PreviewPrivateImportQuery {
  constructor(
    public readonly userId: string,
    public readonly exercises: Array<{
      name: string;
      sportType: string;
      targetMuscleGroup?: string;
      runningType?: string;
    }>,
  ) {}
}

export interface PrivateImportPreviewItem {
  index: number;
  name: string;
  sportType: string;
  status: 'admin-existing' | 'custom-existing' | 'new';
  existingId?: string;
  adminExerciseId?: string;
  customExerciseId?: string;
}

export interface PrivateImportPreviewResponse {
  results: PrivateImportPreviewItem[];
  summary: { admin: number; custom: number; new: number };
}