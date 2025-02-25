'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import _ from 'lodash';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import { TransitionProps } from '@mui/material/transitions';

import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { ReactElement, ReactNode, forwardRef, Ref, useCallback, useState, createContext } from 'react';

const SlideUpTransition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
) {
    const router = useRouter();
    return <Slide direction="up" ref={ref} {...props} onExited={() => router.back()} />;
});

const FadeInTransition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement;
    },
    ref: Ref<unknown>
) {
    const router = useRouter();
    return <Fade ref={ref} {...props} onExited={() => router.back()} />;
});

type ModalContext = {
    close: () => void
};

export const ModalContext = createContext<ModalContext | null>(null);

export default function Modal({
    children
}: {
    children: ReactNode
}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(true);

    const onClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Dialog
            open={open}
            fullScreen={fullScreen}
            slots={{
                transition: fullScreen ? SlideUpTransition : FadeInTransition
            }}
            disableScrollLock
            maxWidth="lg"
            onClose={onClose}>
            {fullScreen &&
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>}
            <DialogContent>
                <Box
                    sx={{
                        p: {
                            [theme.breakpoints.up('lg')]: 4,
                        }
                    }}>
                    <ModalContext.Provider value={{
                        close: () => setOpen(false)
                    }}>
                        {children}
                    </ModalContext.Provider>
                </Box>
            </DialogContent>
        </Dialog>
    )
}