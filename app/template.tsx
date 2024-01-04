'use client';

import './globals.css'
import { styled, Theme, CSSObject } from '@mui/material/styles';
import { useState } from 'react';
import * as React from 'react';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MuiDrawer, { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
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
import Stack from '@mui/material/Stack';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CommitIcon from '@mui/icons-material/Commit';
import { SnackbarProvider } from 'notistack';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const drawerWidth = 256;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const invisibleMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    width: 0,
});

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

interface DrawerProps extends MuiDrawerProps {
    visible?: boolean;
};

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'visible' && prop !== 'open'
})<DrawerProps>(({ theme, open, visible }) => ({
    width: visible ? drawerWidth : 0,
    whiteSpace: 'nowrap',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
    ...(!visible && {
        ...invisibleMixin(theme),
        '& .MuiDrawer-paper': invisibleMixin(theme),
    })
}));



export default function RootTemplate({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(true);
    const [expand, setExpand] = useState(false);
    const pathname = usePathname();
    const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const currentTheme = React.useMemo(
        () => createTheme({
            palette: {
                mode: preferDarkMode ? 'dark' : 'light',
            },
        }),
        [preferDarkMode]
    );

    function callExpand(state: boolean) {
        return () => { setExpand(state); };
    }

    function callOpen(state: boolean) {
        return () => { setOpen(state); };
    }

    function DrawerItem({ title, href, icon }: { title: string, href: string, icon: React.ReactElement }) {
        return (
            <ListItemButton
                href={href}
                LinkComponent={Link}
                selected={pathname == href}
            >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                    primary={title}
                    sx={{
                        opacity: {
                            xs: 1,
                            md: expand ? 1 : 0
                        }
                    }} />
            </ListItemButton>
        )
    }

    const drawerContent = (
        <List>
            <DrawerItem title="Home" href="/" icon={<Home />} />
            <DrawerItem title="Tag" href="/tag" icon={<TagIcon />} />
            <DrawerItem title="Document" href="/doc" icon={<TextSnippetIcon />} />
            <Divider component="li" />
            <li>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                    Post
                </Typography>
            </li>
            <DrawerItem title="List" href="/post/list" icon={<FormatListBulletedIcon />} />
            <DrawerItem title="Upload" href="/post/upload" icon={<FileUploadIcon />} />
            <DrawerItem title="Search" href="/post/search" icon={<Search />} />
            <DrawerItem title="Find similar" href="/post/similar" icon={<ImageIcon />} />
            <Divider component="li" />
            <li>
                <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                    {expand ? "Template" : "Temp."}
                </Typography>
            </li>
            <DrawerItem title="List" href="/template" icon={<AccountTreeIcon />} />
            <DrawerItem title="Upload" href="/template/upload" icon={<FileUploadIcon />} />
        </List>
    )

    return (
        <ThemeProvider theme={currentTheme}>

            <CssBaseline />
            <AppBar
                position="fixed"
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        zIndex: theme.zIndex.drawer + 1
                    },
                    [theme.breakpoints.down('sm')]: {
                        zIndex: 'auto'
                    }
                })}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        onClick={callOpen(!open)}
                        sx={{ mr: 2 }}>
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

            <Drawer
                variant="permanent"
                open={expand}
                visible={open}
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        display: 'block'
                    },
                    [theme.breakpoints.down('sm')]: {
                        display: 'none'
                    }
                })}
                onMouseEnter={callExpand(true)}
                onMouseLeave={callExpand(false)}>
                <Toolbar />

                {drawerContent}

            </Drawer>

            <MuiDrawer
                variant="temporary"
                disableScrollLock
                open={open}
                onClose={callOpen(false)}
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        display: 'none'
                    },
                    [theme.breakpoints.down('sm')]: {
                        display: 'block'
                    }
                })}>
                <Box sx={{ width: drawerWidth }}>
                    {drawerContent}
                </Box>
            </MuiDrawer>

            <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
                <Box
                    component="main"
                    sx={theme => ({
                        [theme.breakpoints.up('md')]: {
                            ml: open ? `calc(${theme.spacing(8)} + 1px)` : 0,
                        },
                        [theme.breakpoints.down('sm')]: {
                            ml: 0
                        },
                        transition: theme.transitions.create(['margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        ...(open && {
                            transition: theme.transitions.create(['margin'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        })
                    })}>
                    <Container>
                        <Toolbar sx={{ zIndex: -1 }} />
                        {children}
                    </Container>
                </Box>
            </SnackbarProvider>

        </ThemeProvider >
    )
}
