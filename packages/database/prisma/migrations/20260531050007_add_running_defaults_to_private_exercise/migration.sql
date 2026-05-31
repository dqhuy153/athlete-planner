-- AlterTable
ALTER TABLE "private_exercises" ADD COLUMN     "defaultDurationMinutes" INTEGER,
ADD COLUMN     "defaultHrMax" INTEGER,
ADD COLUMN     "defaultHrMin" INTEGER,
ADD COLUMN     "defaultHrZone" INTEGER,
ADD COLUMN     "defaultIntensityType" TEXT,
ADD COLUMN     "defaultPaceMaxSecPerKm" INTEGER,
ADD COLUMN     "defaultPaceMinSecPerKm" INTEGER,
ADD COLUMN     "defaultTargetDistanceKm" DOUBLE PRECISION;
