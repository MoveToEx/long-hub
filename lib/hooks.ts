import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import _ from 'lodash';

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

    const setMany = (value: Partial<T>) => {
        setState(original => ({
            ...original,
            ...value
        }));
    }

    const setSingle = <K extends keyof T>(key: K, value: T[K]) => {
        setState(original => ({
            ...original,
            [key]: value
        }));
    }

    const reset = () => {
        setState(initial);
    }

    return { state, setSingle, setMany, reset };
}