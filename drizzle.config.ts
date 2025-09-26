import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './utils/schema.jsx',
  dialect: 'postgresql',
  dbCredentials: {
    url:'postgresql://neondb_owner:npg_JyB5kwM2UNQa@ep-hidden-base-aelxk15n-pooler.c-2.us-east-2.aws.neon.tech/Expense-tracker?sslmode=require&channel_binding=require',
  },
});
