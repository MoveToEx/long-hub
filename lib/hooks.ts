import { useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import _ from 'lodash';

export type SetSearchParamAction<T> = (value: T) => void;
export type SearchParamParser<T> = T extends string ? undefined : (value: string) => T;

export function useSearchParam<T>(
    key: string,
    defaultValue: T,
    parser?: SearchParamParser<T>
): [T, SetSearchParamAction<T>] {
    const params = useSearchParams();
    const pathname = usePathname();

    const _parser = useCallback((value: string) => {
        if (!parser) {  // parser === undefined => T = string
            return value as T;
        } else {
            return parser(value);
        }
    }, [parser]);

    const [state, setState] = useState(() => {
        const value = params.get(key);
        if (value === null) {
            return defaultValue;
        }
        return _parser(value);
    });

    useEffect(() => {
        let value;
        const raw = params.get(key);
        
        if (raw !== null) {
            value = _parser(raw);
        } else {
            value = defaultValue;
        }

        if (!_.isEqual(state, value)) {
            setState(value);
        }
    }, [params, key, defaultValue, state, _parser]);

    const setter = (value: T) => {
        const searchParams = new URLSearchParams(params);
        if (!_.isEqual(value, defaultValue)) {
            searchParams.set(key, String(value));
        } else {
            searchParams.delete(key);
        }
        window.history.pushState(null, '', pathname + '?' + searchParams.toString());

        setState(value);
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