'use server';

import { set, type Configuration } from "@/lib/config";
import { revalidatePath } from "next/cache";

export async function setConfig<K extends keyof Configuration>(key: K, value: Configuration[K]) {
    await set(key, value);
    revalidatePath('/admin/config');
}