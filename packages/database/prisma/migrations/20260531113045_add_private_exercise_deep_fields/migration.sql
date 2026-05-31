-- AlterTable
ALTER TABLE "private_exercises" ADD COLUMN     "instructions" JSONB,
ADD COLUMN     "workoutStructure" JSONB,
ADD COLUMN     "youtubeEmbedUrl" TEXT;
