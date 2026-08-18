-- DropForeignKey
ALTER TABLE "order_audits" DROP CONSTRAINT "order_audits_userId_fkey";

-- AlterTable
ALTER TABLE "order_audits" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "order_audits" ADD CONSTRAINT "order_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
