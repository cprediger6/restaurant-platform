@echo off
echo 🔄 Limpiando caché de Prisma...
rmdir /s /q node_modules\.prisma
rmdir /s /q node_modules\@prisma

echo 📦 Reinstalando paquetes de Prisma...
call npm install @prisma/client@latest prisma@latest

echo 🔄 Generando cliente de Prisma...
call npx prisma generate

echo 📋 Verificando modelos...
call npx ts-node scripts/check-prisma-models.ts

echo ✅ Proceso completado
