import { z } from 'zod';

const envSchema = z.object({
  ADMIN_KEY: z.string().min(1, 'ADMIN_KEY is required'),
  NEXT_PUBLIC_CURRENCY: z.string().min(1, 'NEXT_PUBLIC_CURRENCY is required'),
  DATA_PROVIDER: z.string().min(1, 'DATA_PROVIDER is required'),
});

export function validateEnv() {
  try {
    const env = {
      ADMIN_KEY: process.env.ADMIN_KEY,
      NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
      DATA_PROVIDER: process.env.DATA_PROVIDER,
    };

    const result = envSchema.safeParse(env);
    
    if (!result.success) {
      console.error('❌ Environment validation failed:');
      for (const error of result.error.issues ?? []) {
        console.error(`  - ${error.path.join('.')}: ${error.message}`);
      }
      throw new Error('Invalid environment configuration');
    }

    console.log('✅ Environment validation passed');
    return result.data;
  } catch (error) {
    console.error('❌ Environment validation error:', error);
    throw error;
  }
}

export const env = validateEnv();