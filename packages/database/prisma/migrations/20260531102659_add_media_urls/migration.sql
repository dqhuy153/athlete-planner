-- AlterTable
ALTER TABLE "gym_exercise_masters" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "private_exercises" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "running_exercise_masters" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasUsedFreeExport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referencePaceMinPerKm" DOUBLE PRECISION,
ADD COLUMN     "referenceWeightKg" DOUBLE PRECISION;
