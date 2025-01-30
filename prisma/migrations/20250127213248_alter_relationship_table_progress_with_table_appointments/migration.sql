/*
  Warnings:

  - You are about to drop the column `appointment_id` on the `progress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "progress" DROP CONSTRAINT "progress_appointment_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "progress_id" TEXT;

-- AlterTable
ALTER TABLE "progress" DROP COLUMN "appointment_id";

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_progress_id_fkey" FOREIGN KEY ("progress_id") REFERENCES "progress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
