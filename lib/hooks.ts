import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import _ from 'lodash';
import { Rating } from '@/lib/schema';

export type SyncedSearchParamItem<V> = {
    defaultValue: V,
    parser: (value: string) => V,
    serializer: (value: V) => string,
}

export type SyncedSearchParamItems<T> = {
    [K in keyof T]: SyncedSearchParamItem<T[K]>;
}

export type SyncedSearchParamSetter<T> = (values: Partial<T>) => void;

export function useSyncedSearchParams<T>(items: SyncedSearchParamItems<T>): [T, SyncedSearchParamSetter<T>] {
    const params = useSearchParams();
    const ignore = useRef(false);  // whether current change is caused by setter and thus should be ignored

    const [state, setState] = useState<T>(() => {
        let result = {} as T;
        for (const key in items) {
            if (params.has(key)) {
                result[key] = items[key].parser(params.get(key)!);
            }
            else {
                result[key] = items[key].defaultValue;
            }
        }
        return result;
    });

    useEffect(() => {
        if (ignore.current) return;

        const newState = _.cloneDeep(state);

        for (const key in items) {
            const paramValue = params.has(key) ? items[key].parser(params.get(key)!) : items[key].defaultValue;
            if (!_.isEqual(paramValue, newState[key])) {
                newState[key] = paramValue;
            }
        }

        if (!_.isEqual(newState, state)) {
            setState(newState);
        }
    }, [state, params, items]);

    const setter = (values: Partial<T>) => {
        const newState = _.cloneDeep(state);
        const searchParams = new URLSearchParams(params);

        for (const key in values) {
            if (values[key] === undefined) continue;
            
            newState[key] = values[key];
            
            if (!_.isEqual(values[key], items[key].defaultValue)) {
                searchParams.set(key, items[key].serializer(values[key]));
            }
            else {
                searchParams.delete(key);
            }
        }
        
        ignore.current = true;
        setState(newState);

        window.history.pushState(null, '', '?' + searchParams.toString());

        Promise.resolve().then(() => {
            ignore.current = false;
        });
    }

    return [state, setter];
}


export type SetCompositeStateAction<T> = (value: Partial<T>) => void;

export function useCompositeState<T>(initial: T) {
    const [state, setState] = useState(initial);

    const setMany = useCallback((value: Partial<T>) => {
        setState(original => ({
            ...original,
            ...value
        }));
    }, []);

    const setSingle = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setState(original => ({
            ...original,
            [key]: value
        }));
    }, []);

    const reset = useCallback(() => {
        setState(initial);
    }, [initial]);

    return { state, setSingle, setMany, reset };
}

export type UploadState = 'idle' | 'wait-sign' | 'uploading' | 'wait-ack';

type Metadata = {
    text: string,
    rating: Rating,
    tags: string[]
}

export type UploadStateDispatch = {
    submit: (metadata: Metadata, blob: Blob) => Promise<boolean>,
    state: UploadState,
    progress: number | null,
    id: string | null,
    error: Error | null,
}

export function useUploadState(): UploadStateDispatch {
    const [state, setState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState<number | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const submit = useCallback(async (metadata: Metadata, blob: Blob) => {
        try {
            setState('wait-sign');

            let response = await fetch('/api/post/upload/sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mime: blob.type
                }),
            });

            if (!response.ok) {
                throw new Error('Failed when acquiring presigned url: ' + response.status);
            }

            const { url, id } = await response.json();

            setId(id);
            setState('uploading');

            let status: number = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setProgress((100 * event.loaded) / event.total);
                    }
                };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        resolve(xhr.status);
                    }
                };

                xhr.onerror = () => {
                    reject(xhr.status);
                };
                xhr.open('PUT', url, true);
                xhr.setRequestHeader('Content-Type', blob.type);
                xhr.send(blob);
            });

            if (!(status >= 200 && status < 300)) {
                throw new Error('Failed when uploading: ' + status);
            }

            setState('wait-ack');

            response = await fetch('/api/post/upload/ack', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    metadata
                }),
            });

            if (!response.ok) {
                throw new Error('Failed when sending completion: ' + response.statusText);
            }

            return true;
        }
        catch (e) {
            if (e instanceof Error) {
                setError(e);
            }

            return false;
        }
        finally {
            setState('idle');
            setId(null);
            setProgress(null);
        }
    }, []);
    
    return { submit, state, progress, id, error };
}