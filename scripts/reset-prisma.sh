#!/bin/bash

echo "🔄 Limpiando caché de Prisma..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

echo "📦 Reinstalando paquetes de Prisma..."
npm install @prisma/client@latest prisma@latest

echo "🔄 Generando cliente de Prisma..."
npx prisma generate

echo "📋 Verificando modelos..."
npx ts-node scripts/check-prisma-models.ts

echo "✅ Proceso completado"
