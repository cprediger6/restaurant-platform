-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "conversionFactor" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "recipeId" TEXT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
