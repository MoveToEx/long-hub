'use client';

import { z } from 'zod';
import { useLocalStorage } from 'usehooks-ts';

// Schema for preferences stored in `localStorage` on client
export const localSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional().default('system')
});

export type LocalPreference = z.infer<typeof localSchema>;

export function usePreference() {
    return useLocalStorage('preference', () => localSchema.parse({}));
}