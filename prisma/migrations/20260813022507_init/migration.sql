-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'CASHIER');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'SHIPPED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER');

-- CreateEnum
CREATE TYPE "CostMethod" AS ENUM ('FIFO', 'LIFO', 'AVERAGE', 'STANDARD');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'PARTIALLY_CLOSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PREPARATION', 'READY', 'DELIVERED', 'BILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'America/Panama',
    "country" TEXT NOT NULL DEFAULT 'Panama',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryTaxId" TEXT,
    "taxName" TEXT DEFAULT 'ITBMS',

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "aisle" TEXT NOT NULL,
    "shelf" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "barcode" TEXT,
    "warehouseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'WAITER',
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastPasswordChange" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "passwordHistory" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "canPrint" BOOLEAN NOT NULL DEFAULT false,
    "canViewCost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "qrCode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "color" TEXT,
    "size" TEXT,
    "weight" DOUBLE PRECISION,
    "dimensions" JSONB,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasIva" BOOLEAN NOT NULL DEFAULT true,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'Unidad',
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservedStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transitStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderPoint" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costMethod" "CostMethod" NOT NULL DEFAULT 'FIFO',
    "standardCost" DOUBLE PRECISION,
    "lastCost" DOUBLE PRECISION,
    "averageCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "inventoryItemId" TEXT NOT NULL,
    "sourceWarehouseId" TEXT,
    "targetWarehouseId" TEXT,
    "userId" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kardex" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movementId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityIn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantityOut" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kardex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "ruc" TEXT,
    "address" TEXT,
    "contactPerson" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "ruc" TEXT,
    "address" TEXT,
    "contactPerson" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "supplierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_details" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "received" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'PENDING',
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "commission" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taxAmount" DOUBLE PRECISION,
    "taxName" TEXT,
    "taxRate" DOUBLE PRECISION,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_details" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reference" TEXT,
    "purchaseId" TEXT,
    "saleId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientId" TEXT,
    "supplierId" TEXT,
    "purchaseId" TEXT,
    "saleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "allowNegativeInventory" BOOLEAN NOT NULL DEFAULT false,
    "defaultCostMethod" "CostMethod" NOT NULL DEFAULT 'FIFO',
    "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_taxes" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "taxName" TEXT NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "loginNotifications" BOOLEAN NOT NULL DEFAULT true,
    "sessionConcurrency" BOOLEAN NOT NULL DEFAULT true,
    "requireStrongPassword" BOOLEAN NOT NULL DEFAULT true,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 90,
    "preventPasswordReuse" BOOLEAN NOT NULL DEFAULT true,
    "forceLogoutAfterDays" INTEGER NOT NULL DEFAULT 30,
    "blockSuspiciousIPs" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "ipAddress" TEXT,
    "location" TEXT,
    "userAgent" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "location" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diners" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "yield" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "prepTime" INTEGER,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "consumeInventory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "dinerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_ruc_key" ON "companies"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "locations_barcode_key" ON "locations"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_internalCode_key" ON "products"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_qrCode_key" ON "products"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "variants_sku_key" ON "variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "variants_barcode_key" ON "variants"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_ruc_key" ON "suppliers"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "clients_ruc_key" ON "clients"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_number_key" ON "purchases"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_number_key" ON "sales"("number");

-- CreateIndex
CREATE UNIQUE INDEX "settings_companyId_key" ON "settings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_companyId_key" ON "currencies"("code", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "country_taxes_country_key" ON "country_taxes"("country");

-- CreateIndex
CREATE UNIQUE INDEX "report_settings_companyId_reportId_key" ON "report_settings"("companyId", "reportId");

-- CreateIndex
CREATE UNIQUE INDEX "security_settings_companyId_key" ON "security_settings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_userId_idx" ON "login_attempts"("userId");

-- CreateIndex
CREATE INDEX "login_attempts_timestamp_idx" ON "login_attempts"("timestamp");

-- CreateIndex
CREATE INDEX "tables_companyId_idx" ON "tables"("companyId");

-- CreateIndex
CREATE INDEX "tables_status_idx" ON "tables"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tables_companyId_number_key" ON "tables"("companyId", "number");

-- CreateIndex
CREATE INDEX "diners_tableId_idx" ON "diners"("tableId");

-- CreateIndex
CREATE INDEX "diners_active_idx" ON "diners"("active");

-- CreateIndex
CREATE INDEX "recipes_companyId_idx" ON "recipes"("companyId");

-- CreateIndex
CREATE INDEX "recipes_isActive_idx" ON "recipes"("isActive");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipeId_idx" ON "recipe_ingredients"("recipeId");

-- CreateIndex
CREATE INDEX "recipe_ingredients_productId_idx" ON "recipe_ingredients"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_recipeId_productId_key" ON "recipe_ingredients"("recipeId", "productId");

-- CreateIndex
CREATE INDEX "orders_dinerId_idx" ON "orders"("dinerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "restaurant_payments_orderId_idx" ON "restaurant_payments"("orderId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_countryTaxId_fkey" FOREIGN KEY ("countryTaxId") REFERENCES "country_taxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variants" ADD CONSTRAINT "variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_sourceWarehouseId_fkey" FOREIGN KEY ("sourceWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_targetWarehouseId_fkey" FOREIGN KEY ("targetWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex" ADD CONSTRAINT "kardex_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex" ADD CONSTRAINT "kardex_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "inventory_movements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_settings" ADD CONSTRAINT "report_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_settings" ADD CONSTRAINT "security_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diners" ADD CONSTRAINT "diners_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_dinerId_fkey" FOREIGN KEY ("dinerId") REFERENCES "diners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_payments" ADD CONSTRAINT "restaurant_payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
