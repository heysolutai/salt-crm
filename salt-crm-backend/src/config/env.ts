import { z } from 'zod';

const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    API_URL: z.string().url().default('http://localhost:3000'),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),

    DATABASE_URL: z.string().url(),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    UAZAPI_BASE_URL: z.string().url().optional(),
    UAZAPI_API_KEY: z.string().optional(),

    OPENAI_API_KEY: z.string().optional(),

    N8N_WEBHOOK_URL: z.string().url().optional(),
    INTERNAL_API_KEY: z.string().optional(),
});

function loadEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:');
        console.error(parsed.error.format());
        process.exit(1);
    }

    return parsed.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
