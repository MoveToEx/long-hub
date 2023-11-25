'use client';

import './globals.css'
import { useState } from 'react';
import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import Home from '@mui/icons-material/Home';
import TagIcon from '@mui/icons-material/Tag';
import Search from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ImageIcon from '@mui/icons-material/Image';
import Menu from '@mui/icons-material/Menu';
import Image from 'next/image';
import Link from 'next/link';
import { SnackbarProvider } from 'notistack';

export default function RootTemplate({
    children,
}: {
    children: React.ReactNode
}) {
    const [menuState, setMenuState] = useState(false);
    const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = React.useMemo(
        () => createTheme({
            palette: {
                mode: preferDarkMode ? 'dark' : 'light',
            },
        }),
        [preferDarkMode]
    );

    function toggleMenu() {
        setMenuState(!menuState);
    }

    function DrawerItem({ title, href, icon }: { title: string, href: string, icon: React.ReactElement }) {
        return (
            <ListItemButton
                href={href}
                LinkComponent={Link}
                selected={window.location.pathname == href}
                onClick={() => setMenuState(false)}
            >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={title} />
            </ListItemButton>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }} onClick={toggleMenu}>
                            <Menu />
                        </IconButton>
                        <Link href="/">
                            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                                L
                                <Image height={18} width={18} src="/o.png" alt="o" />
                                NG Hub
                            </Typography>
                        </Link>
                    </Toolbar>
                </AppBar>
                <Toolbar />
            </Box>

            <Drawer anchor="left" open={menuState} onClose={toggleMenu} disableScrollLock>
                <Box sx={{ width: 256 }} role="presentation">
                    <List>
                        <DrawerItem title="Home" href="/" icon={<Home />} />
                        <DrawerItem title="Tag" href="/tag" icon={<TagIcon />} />
                        <DrawerItem title="List" href="/post/list" icon={<FormatListBulletedIcon />} />
                        <DrawerItem title="Upload" href="/post/upload" icon={<FileUploadIcon />} />
                        <DrawerItem title="Search" href="/post/search" icon={<Search />} />
                        <DrawerItem title="Find similar" href="/post/similar" icon={<ImageIcon />} />
                        <DrawerItem title="Document" href="/doc" icon={<TextSnippetIcon />} />
                    </List>
                </Box>
            </Drawer>

            <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
                <Box component="main">
                    <Container>
                        {children}
                    </Container>
                </Box>
            </SnackbarProvider>
        </ThemeProvider>
    )
}
