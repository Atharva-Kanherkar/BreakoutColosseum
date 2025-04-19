/*
  Warnings:

  - The values [SCHEDULED] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REGISTRATION,UPCOMING] on the enum `TournamentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dispute` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `entryFee` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `participantType` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `prizePool` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `registrationEnd` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `rules` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `Tournament` table. All the data in the column will be lost.
  - The `format` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Participation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[captainId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,tournamentId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `captainId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournamentId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostId` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');
ALTER TABLE "Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "MatchStatus_old";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TournamentStatus_new" AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Tournament" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tournament" ALTER COLUMN "status" TYPE "TournamentStatus_new" USING ("status"::text::"TournamentStatus_new");
ALTER TYPE "TournamentStatus" RENAME TO "TournamentStatus_old";
ALTER TYPE "TournamentStatus_new" RENAME TO "TournamentStatus";
DROP TYPE "TournamentStatus_old";
ALTER TABLE "Tournament" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_participantAId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_participantBId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tournament" DROP CONSTRAINT "Tournament_organizerId_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "dispute",
ADD COLUMN     "nextMatchId" TEXT,
ADD COLUMN     "scheduledTime" TIMESTAMP(3),
ADD COLUMN     "teamAId" TEXT,
ADD COLUMN     "teamBId" TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "creatorId",
DROP COLUMN "tag",
ADD COLUMN     "captainId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "tournamentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "entryFee",
DROP COLUMN "organizerId",
DROP COLUMN "participantType",
DROP COLUMN "prizePool",
DROP COLUMN "registrationEnd",
DROP COLUMN "rules",
DROP COLUMN "title",
DROP COLUMN "visibility",
ADD COLUMN     "hostId" TEXT NOT NULL,
ADD COLUMN     "isTeamBased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minParticipants" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "teamSize" INTEGER,
DROP COLUMN "format",
ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'SINGLE_ELIMINATION',
ALTER COLUMN "status" SET DEFAULT 'DRAFT',
ALTER COLUMN "startDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "displayName",
DROP COLUMN "role",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "supabaseId" DROP NOT NULL;

-- DropTable
DROP TABLE "Participation";

-- DropTable
DROP TABLE "TeamMember";

-- DropEnum
DROP TYPE "ParticipantStatus";

-- DropEnum
DROP TYPE "ParticipantType";

-- DropEnum
DROP TYPE "TeamRole";

-- DropEnum
DROP TYPE "TournamentFormat";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "Visibility";

-- CreateTable
CREATE TABLE "TournamentParticipant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seed" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentAnnouncement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "importance" TEXT NOT NULL DEFAULT 'medium',
    "tournamentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "TournamentAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SpectatedTournaments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SpectatedTournaments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "TournamentParticipant_userId_idx" ON "TournamentParticipant"("userId");

-- CreateIndex
CREATE INDEX "TournamentParticipant_tournamentId_idx" ON "TournamentParticipant"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentParticipant_teamId_idx" ON "TournamentParticipant"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentParticipant_userId_tournamentId_key" ON "TournamentParticipant"("userId", "tournamentId");

-- CreateIndex
CREATE INDEX "TournamentAnnouncement_tournamentId_idx" ON "TournamentAnnouncement"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentAnnouncement_authorId_idx" ON "TournamentAnnouncement"("authorId");

-- CreateIndex
CREATE INDEX "_SpectatedTournaments_B_index" ON "_SpectatedTournaments"("B");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_teamAId_idx" ON "Match"("teamAId");

-- CreateIndex
CREATE INDEX "Match_teamBId_idx" ON "Match"("teamBId");

-- CreateIndex
CREATE INDEX "Match_participantAId_idx" ON "Match"("participantAId");

-- CreateIndex
CREATE INDEX "Match_participantBId_idx" ON "Match"("participantBId");

-- CreateIndex
CREATE INDEX "Match_judgeId_idx" ON "Match"("judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_captainId_key" ON "Team"("captainId");

-- CreateIndex
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_tournamentId_key" ON "Team"("name", "tournamentId");

-- CreateIndex
CREATE INDEX "Tournament_hostId_idx" ON "Tournament"("hostId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_participantAId_fkey" FOREIGN KEY ("participantAId") REFERENCES "TournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_participantBId_fkey" FOREIGN KEY ("participantBId") REFERENCES "TournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "TournamentParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentAnnouncement" ADD CONSTRAINT "TournamentAnnouncement_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentAnnouncement" ADD CONSTRAINT "TournamentAnnouncement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpectatedTournaments" ADD CONSTRAINT "_SpectatedTournaments_A_fkey" FOREIGN KEY ("A") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpectatedTournaments" ADD CONSTRAINT "_SpectatedTournaments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
