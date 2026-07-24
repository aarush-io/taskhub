-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'WORKER');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('POST', 'COMMENT', 'REPLY');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('AVAILABLE', 'CLAIMED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TASK_APPROVAL', 'ADJUSTMENT', 'PAYOUT');

-- Referral and Discord account-linking support.
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'REFERRAL_REWARD';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'REFERRAL_BONUS';
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WORKER',
    "redditUsername" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "claimBanned" BOOLEAN NOT NULL DEFAULT false,
    "claimBannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "lastClaimAt" TIMESTAMP(3),
    "referralCode" TEXT NOT NULL,
    "discordId" TEXT,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "discordLinkedAt" TIMESTAMP(3),
    "discordUnlinkedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'reddit',
    "targetUrl" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "rewardSnapshot" DECIMAL(10,2) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'AVAILABLE',
    "scheduledFor" TIMESTAMP(3),
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "claimedById" TEXT,
    "claimedAt" TIMESTAMP(3),
    "claimExpiresAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "mainLink" TEXT NOT NULL,
    "randomLink1" TEXT NOT NULL,
    "randomLink2" TEXT NOT NULL,
    "randomLink3" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceTransaction" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "taskId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "postReward" DECIMAL(10,2) NOT NULL DEFAULT 2.00,
    "commentReward" DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    "replyReward" DECIMAL(10,2) NOT NULL DEFAULT 0.50,
    "claimCooldownMin" INTEGER NOT NULL DEFAULT 30,
    "claimTimeoutMin" INTEGER NOT NULL DEFAULT 60,
    "maxActiveTasks" INTEGER NOT NULL DEFAULT 3,
    "referralReward" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "referredWorkerBonus" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

-- Optional worker-facing Discord support destination.
ALTER TABLE "GlobalSettings" ADD COLUMN IF NOT EXISTS "discordSupportUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- Performance indexes for dashboard, task filtering, and admin queues.
CREATE INDEX "User_role_lastActiveAt_idx" ON "User"("role", "lastActiveAt");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");

-- CreateIndex
CREATE INDEX "Task_claimedById_idx" ON "Task"("claimedById");

CREATE INDEX "Task_status_category_createdAt_idx" ON "Task"("status", "category", "createdAt");
CREATE INDEX "Task_status_isPaused_scheduledFor_idx" ON "Task"("status", "isPaused", "scheduledFor");

CREATE INDEX "Task_claimedById_status_idx" ON "Task"("claimedById", "status");

CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_taskId_key" ON "Submission"("taskId");

-- CreateIndex
CREATE INDEX "Submission_workerId_idx" ON "Submission"("workerId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_mainLink_idx" ON "Submission"("mainLink");

CREATE INDEX "Submission_workerId_submittedAt_idx" ON "Submission"("workerId", "submittedAt");

CREATE INDEX "Submission_status_submittedAt_idx" ON "Submission"("status", "submittedAt");

CREATE INDEX "Submission_reviewedById_idx" ON "Submission"("reviewedById");

-- CreateIndex
CREATE INDEX "BalanceTransaction_workerId_idx" ON "BalanceTransaction"("workerId");

-- CreateIndex
CREATE INDEX "BalanceTransaction_createdAt_idx" ON "BalanceTransaction"("createdAt");

CREATE INDEX "BalanceTransaction_workerId_type_idx" ON "BalanceTransaction"("workerId", "type");
CREATE UNIQUE INDEX "Referral_referredId_key" ON "Referral"("referredId");
CREATE INDEX "Referral_referrerId_status_idx" ON "Referral"("referrerId", "status");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
