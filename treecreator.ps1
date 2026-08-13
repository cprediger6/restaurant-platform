# ============================================================
# Crear estructura de proyecto - Restaurant Platform
# ============================================================

$root = "src"

# ------------------------------------------------------------
# Directorios
# ------------------------------------------------------------

$directories = @(
    "$root/app",
    "$root/app/(auth)",
    "$root/app/(auth)/login",
    "$root/app/(auth)/register",

    "$root/app/(dashboard)",
    "$root/app/(dashboard)/dashboard",
    "$root/app/(dashboard)/tables",
    "$root/app/(dashboard)/tables/[id]",
    "$root/app/(dashboard)/recipes",
    "$root/app/(dashboard)/recipes/create",
    "$root/app/(dashboard)/recipes/[id]",
    "$root/app/(dashboard)/orders",
    "$root/app/(dashboard)/orders/[id]",
    "$root/app/(dashboard)/inventory",

    "$root/components",
    "$root/components/tables",
    "$root/components/recipes",
    "$root/components/orders",
    "$root/components/ui",

    "$root/lib",
    "$root/lib/services",
    "$root/lib/repositories",
    "$root/lib/validations",

    "$root/types",

    "$root/hooks"
)

# Crear directorios
foreach ($directory in $directories) {
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
        Write-Host "Directorio creado: $directory" -ForegroundColor Green
    }
    else {
        Write-Host "Ya existe: $directory" -ForegroundColor Yellow
    }
}

# ------------------------------------------------------------
# Archivos
# ------------------------------------------------------------

$files = @(
    # App - Auth
    "$root/app/(auth)/login/page.tsx",
    "$root/app/(auth)/register/page.tsx",

    # App - Dashboard
    "$root/app/(dashboard)/dashboard/page.tsx",

    # Tables
    "$root/app/(dashboard)/tables/page.tsx",
    "$root/app/(dashboard)/tables/[id]/page.tsx",

    # Recipes
    "$root/app/(dashboard)/recipes/page.tsx",
    "$root/app/(dashboard)/recipes/create/page.tsx",
    "$root/app/(dashboard)/recipes/[id]/page.tsx",

    # Orders
    "$root/app/(dashboard)/orders/page.tsx",
    "$root/app/(dashboard)/orders/[id]/page.tsx",

    # Inventory
    "$root/app/(dashboard)/inventory/page.tsx",

    # Root layout
    "$root/app/layout.tsx",

    # Components - Tables
    "$root/components/tables/TableGrid.tsx",
    "$root/components/tables/TableCard.tsx",
    "$root/components/tables/TableDetails.tsx",

    # Components - Recipes
    "$root/components/recipes/RecipeForm.tsx",
    "$root/components/recipes/RecipeList.tsx",
    "$root/components/recipes/RecipeIngredients.tsx",

    # Components - Orders
    "$root/components/orders/OrderForm.tsx",
    "$root/components/orders/OrderList.tsx",
    "$root/components/orders/OrderSummary.tsx",

    # Services
    "$root/lib/services/products.service.ts",
    "$root/lib/services/recipes.service.ts",
    "$root/lib/services/tables.service.ts",
    "$root/lib/services/orders.service.ts",

    # Repositories
    "$root/lib/repositories/product.repository.ts",
    "$root/lib/repositories/inventory.repository.ts",

    # Validations
    "$root/lib/validations/recipe.schema.ts",
    "$root/lib/validations/order.schema.ts",

    # Types
    "$root/types/restaurant.ts",
    "$root/types/erp.ts",

    # Hooks
    "$root/hooks/useTables.ts",
    "$root/hooks/useRecipes.ts",
    "$root/hooks/useOrders.ts"
)

# Crear archivos
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "Archivo creado: $file" -ForegroundColor Cyan
    }
    else {
        Write-Host "Ya existe: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host " Estructura del proyecto creada correctamente" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""