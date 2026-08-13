// prisma.config.ts
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'), // ✅ Asegura que usa la variable de entorno
  },
});