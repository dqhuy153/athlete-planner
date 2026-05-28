import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// DATABASE_URL is required for migrate/push commands.
// prisma generate does not connect to the database, but v7 still requires
// the datasource url to be defined in prisma.config.ts (not schema.prisma).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/placeholder',
  },
});
