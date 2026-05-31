-- AlterTable
ALTER TABLE "gym_exercise_masters" ADD COLUMN     "defaultAdvancedReps" INTEGER,
ADD COLUMN     "defaultAdvancedRestBetweenExercisesSecs" INTEGER,
ADD COLUMN     "defaultAdvancedRestTimeSecs" INTEGER,
ADD COLUMN     "defaultAdvancedRpe" INTEGER,
ADD COLUMN     "defaultAdvancedSets" INTEGER,
ADD COLUMN     "defaultAdvancedWeightKg" DOUBLE PRECISION,
ADD COLUMN     "defaultBeginnerReps" INTEGER,
ADD COLUMN     "defaultBeginnerRestBetweenExercisesSecs" INTEGER,
ADD COLUMN     "defaultBeginnerRestTimeSecs" INTEGER,
ADD COLUMN     "defaultBeginnerRpe" INTEGER,
ADD COLUMN     "defaultBeginnerSets" INTEGER,
ADD COLUMN     "defaultBeginnerWeightKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "private_exercises" ADD COLUMN     "defaultReps" INTEGER,
ADD COLUMN     "defaultRpe" INTEGER,
ADD COLUMN     "defaultSets" INTEGER,
ADD COLUMN     "defaultWeightKg" DOUBLE PRECISION,
ADD COLUMN     "restBetweenExercisesSecs" INTEGER,
ADD COLUMN     "restTimeSecs" INTEGER,
ADD COLUMN     "sourceGymMasterId" TEXT;
