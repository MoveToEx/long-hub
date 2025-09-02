import { useEffect, useState, useRef, forwardRef, type ForwardedRef } from 'react';
import wcmatch from 'wildcard-match';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import _ from 'lodash';

const DragDrop = forwardRef(function _DragDrop({
    multiple = false,
    accept = '*/*',
    onChange,
    ...rest
}: {
    multiple?: boolean,
    accept?: string | string[],
    onChange: (files: Blob[]) => void
}, ref: ForwardedRef<HTMLDivElement>) {
    const [files, setFiles] = useState<Blob[]>([]);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const match = wcmatch(accept);

    useEffect(() => {
        if (files.length == 0) {
            return;
        }

        onChange(files);
    }, [onChange, files]);

    return (
        <Container
            ref={ref}
            {...rest}
            className={
                'flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-400 dark:border-gray-700 w-full h-64 ' +
                (dragging ? 'bg-gray-200 dark:bg-gray-800 border-blue-400 dark:border-blue-900' : '')
            }
            sx={{
                '& *': {
                    pointerEvents: dragging ? 'none' : 'auto'
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!dragging) setDragging(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragging) setDragging(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(false);

                const items = [...e.dataTransfer.items].filter(item => {
                    return item.kind === 'file' && match(item.type);
                });

                const result = _.compact(items.map(item => item.getAsFile()));

                if (result.length > 0) {
                    setFiles(result);
                }
            }}>
            <input
                ref={inputRef}
                className='hidden'
                type='file'
                accept={typeof accept === 'string' ? accept : accept.join(',')}
                onChange={(e) => {
                    if (e.target.files) setFiles([...e.target.files]);
                }}
                multiple={multiple} />
            <FileUploadIcon sx={{ fontSize: '64px' }} />
            <Typography variant="h6">
                Drop files here,&nbsp;
                <Link onClick={() => {
                    if (inputRef.current) {
                        inputRef.current.click();
                    }
                }}>browse</Link>, or&nbsp;
                <Link onClick={async () => {
                    const items = await navigator.clipboard.read();
                    const result = [];
                    for (const item of items) {
                        for (const type of item.types) {
                            if (match(type)) {
                                result.push(await item.getType(type));
                                break;
                            }
                        }
                    }
                    setFiles(result);
                }}>paste</Link>
            </Typography>
        </Container>
    );
});

export default DragDrop;