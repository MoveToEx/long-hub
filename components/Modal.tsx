'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import _ from 'lodash';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useCallback } from 'react';
import { ReactNode } from 'react';

export default function Modal({
    children
}: {
    children: ReactNode
}) {
    const router = useRouter();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    
    const onClose = useCallback(() => {
        router.back();
    }, [router]);
    
    return (
        <Dialog
            open
            fullScreen={fullScreen}
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
                    {children}
                </Box>
            </DialogContent>
        </Dialog>
    )
}