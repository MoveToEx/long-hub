'use client';

import { useCallback, useRef, useState, useSyncExternalStore } from "react";

type LocalStorageSetter<T> = (value: T | null) => void;

export function useLocalStorage<T>(key: string, defaultValue: T): [T | null, LocalStorageSetter<T>] {

    const subscribe = useCallback((callback: () => void) => {
        window.addEventListener('storage', callback);
        return () => window.removeEventListener('storage', callback);
    }, []);

    const value = useSyncExternalStore(
        subscribe,
        () => window.localStorage.getItem(key)
    );

    const setter = useCallback((value: T | null) => {
        if (value === null) {
            window.localStorage.removeItem(key);
        }
        else {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key]);

    return [value === null ? defaultValue : JSON.parse(value), setter];
}