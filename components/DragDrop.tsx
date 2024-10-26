import { useMemo, useEffect } from 'react';
import Uppy from '@uppy/core';

import { DragDrop as UppyDragDrop, useUppyState } from '@uppy/react';

import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';

export default function DragDrop({ onChange }: {
    onChange: (files: Blob[]) => void
}) {
    const uppy = useMemo(() => new Uppy({
        restrictions: {
            allowedFileTypes: ['image/*']
        }
    }), []);
    const files = useUppyState(uppy, state => state.files);

    useEffect(() => {
        const a = Object.values(files);
        if (a.length == 0) {
            return;
        }

        onChange(a.map(item => item.data));
    }, [onChange, files]);

    return (
        <UppyDragDrop
            uppy={uppy}
            allowMultipleFiles
            width="100%" />
    );
}