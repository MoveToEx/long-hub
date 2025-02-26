import { Rating } from '@prisma/client';
import { useState } from 'react';

export type Metadata = {
    text: string,
    rating: Rating,
    tags: string[]
}

type SetAction = <K extends keyof Metadata>(key: K, value: Metadata[K]) => void;
type ResetAction = () => void;

export function useMetadata(initial: Metadata = {
    text: '',
    rating: Rating.none,
    tags: []
}): [Metadata, SetAction, ResetAction] {
    const [metadata, setMetadata] = useState<Metadata>(initial);

    const setter = <K extends keyof Metadata>(key: K, value: Metadata[K]) => {
        setMetadata({
            ...metadata,
            [key]: value,
        });
    }

    const reset = () => {
        setMetadata(initial);
    }

    return [metadata, setter, reset];
}