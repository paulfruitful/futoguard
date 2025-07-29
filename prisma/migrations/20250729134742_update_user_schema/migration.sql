/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_studentId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "phoneNumber",
DROP COLUMN "studentId",
ADD COLUMN     "contactAddress" TEXT,
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "fullname" TEXT,
ADD COLUMN     "matricNumber" TEXT,
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "modeOfEntry" TEXT,
ADD COLUMN     "passport" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricNumber_key" ON "User"("matricNumber");
