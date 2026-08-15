/*
  Warnings:

  - You are about to drop the column `productId` on the `recipe_ingredients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recipeId,ingredientId]` on the table `recipe_ingredients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_productId_fkey";

-- DropIndex
DROP INDEX "ingredient_allergens_allergenId_idx";

-- DropIndex
DROP INDEX "ingredient_allergens_ingredientId_idx";

-- DropIndex
DROP INDEX "ingredients_companyId_idx";

-- DropIndex
DROP INDEX "ingredients_isActive_idx";

-- DropIndex
DROP INDEX "menu_items_companyId_idx";

-- DropIndex
DROP INDEX "menu_items_isActive_idx";

-- DropIndex
DROP INDEX "recipe_ingredients_productId_idx";

-- DropIndex
DROP INDEX "recipe_ingredients_recipeId_idx";

-- DropIndex
DROP INDEX "recipe_ingredients_recipeId_productId_key";

-- AlterTable
ALTER TABLE "recipe_ingredients" DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "order_audits" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "details" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diner_allergies" (
    "id" TEXT NOT NULL,
    "dinerId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diner_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_audits_orderId_idx" ON "order_audits"("orderId");

-- CreateIndex
CREATE INDEX "order_audits_createdAt_idx" ON "order_audits"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "diner_allergies_dinerId_allergenId_key" ON "diner_allergies"("dinerId", "allergenId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_recipeId_ingredientId_key" ON "recipe_ingredients"("recipeId", "ingredientId");

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_audits" ADD CONSTRAINT "order_audits_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_audits" ADD CONSTRAINT "order_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_allergies" ADD CONSTRAINT "diner_allergies_dinerId_fkey" FOREIGN KEY ("dinerId") REFERENCES "diners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_allergies" ADD CONSTRAINT "diner_allergies_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "allergens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
