import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import _ from 'lodash';
import React from 'react';
import { useRef } from 'react';

type ListenerParameter<Multiple> = Multiple extends true ? File[] : File | null;

export default function DropArea<Multiple extends true | false>({
    accept,
    multiple = false as Multiple,
    label,
    className,
    dragClassName,
    onChange,
}: {
    accept: string,
    multiple?: Multiple,
    label: React.ReactNode,
    className: string,
    dragClassName: string,
    onChange: (param: ListenerParameter<Multiple>) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    return (
        <Stack alignItems="center">
            <input
                ref={inputRef}
                accept={accept}
                multiple={multiple}
                type="file"
                hidden
                onChange={(e) => {
                    if (multiple) {
                        onChange((e.target.files === null ? [] : [...e.target.files]) as ListenerParameter<Multiple>);
                    }
                    else {
                        if (e.target.files === null) {
                            onChange(null as ListenerParameter<Multiple>);
                        }
                        else {
                            onChange(e.target.files.item(0) as ListenerParameter<Multiple>);
                        }
                    }
                }}
            />
            <Box
                ref={boxRef}
                className={className}
                alignItems="center"
                justifyContent="center"
                onClick={() => {
                    inputRef.current?.focus();
                    inputRef.current?.click();
                }}
                onDrop={(e) => {
                    boxRef.current?.classList.remove(dragClassName);

                    e.preventDefault();
                    var a: File[] = [];
                    [...e.dataTransfer.items].forEach(item => {
                        if (item.kind !== 'file') return;
                        const f = item.getAsFile();
                        if (f === null) return;

                        if (!f.type.match(accept.replace('*', '.*'))) {
                            return;
                        }
                        a.push(f);
                    });
                    if (multiple) {
                        onChange(a as ListenerParameter<Multiple>);
                    }
                    else {
                        onChange(a[0] as ListenerParameter<Multiple>);
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    boxRef.current?.classList.add(dragClassName);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    boxRef.current?.classList.remove(dragClassName);
                }} >
                {label}
            </Box>
        </Stack >
    )
}