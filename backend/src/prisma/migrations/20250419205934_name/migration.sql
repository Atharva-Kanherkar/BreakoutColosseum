-- AlterTable
ALTER TABLE "TournamentParticipant" ADD COLUMN     "entryFeeTx" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "walletAddress" TEXT;

-- CreateTable
CREATE TABLE "TournamentPrize" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "entryFee" TEXT,
    "prizePool" TEXT,
    "tokenType" TEXT NOT NULL DEFAULT 'SOL',
    "tokenAddress" TEXT,
    "escrowAddress" TEXT,
    "escrowSignature" TEXT,
    "distribution" JSONB,
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,

    CONSTRAINT "TournamentPrize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizePayment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tournamentPrizeId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "teamId" TEXT,
    "participantId" TEXT,
    "txSignature" TEXT NOT NULL,
    "txConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PrizePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPrize_tournamentId_key" ON "TournamentPrize"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentPrize_tournamentId_idx" ON "TournamentPrize"("tournamentId");

-- CreateIndex
CREATE INDEX "PrizePayment_tournamentPrizeId_idx" ON "PrizePayment"("tournamentPrizeId");

-- CreateIndex
CREATE INDEX "PrizePayment_teamId_idx" ON "PrizePayment"("teamId");

-- CreateIndex
CREATE INDEX "PrizePayment_participantId_idx" ON "PrizePayment"("participantId");

-- AddForeignKey
ALTER TABLE "TournamentPrize" ADD CONSTRAINT "TournamentPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizePayment" ADD CONSTRAINT "PrizePayment_tournamentPrizeId_fkey" FOREIGN KEY ("tournamentPrizeId") REFERENCES "TournamentPrize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizePayment" ADD CONSTRAINT "PrizePayment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizePayment" ADD CONSTRAINT "PrizePayment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "TournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
