import 'dotenv/config';
import * as z from 'zod';

const envSchema = z.object({
    MYSQL_HOST: z.string().min(1),
    MYSQL_PORT: z.coerce.number().int().positive(),
    MYSQL_USER: z.string().min(1),
    MYSQL_PASSWORD: z.string(),
    MYSQL_DATABASE: z.string().min(1),

    APP_NAME: z.string().min(1).default('mysql-admin-mcp'),
    APP_VERSION: z.string().min(1).default('1.0.0'),

    MAX_SELECT_ROWS: z.coerce.number().int().positive().default(1000),
    ENABLE_DESTRUCTIVE_OPERATIONS: z.coerce.boolean().default(false),
    ENABLE_DDL_OPERATIONS: z.coerce.boolean().default(false),
    ENABLE_ROUTINE_OPERATIONS: z.coerce.boolean().default(false)
});

export const env = envSchema.parse(process.env);