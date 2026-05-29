-- CreateEnum
CREATE TYPE "PasswordPromptStatus" AS ENUM ('PENDING', 'SKIPPED', 'DONE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordPromptStatus" "PasswordPromptStatus" NOT NULL DEFAULT 'DONE';
