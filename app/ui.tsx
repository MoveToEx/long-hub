'use client';

import './globals.css'
import { styled, Theme, CSSObject } from '@mui/material/styles';
import { useState, useMemo, Suspense, ReactNode, ElementType, ComponentProps } from 'react';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SecurityIcon from '@mui/icons-material/Security';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import Home from '@mui/icons-material/Home';
import TagIcon from '@mui/icons-material/Tag';
import Search from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ImageIcon from '@mui/icons-material/Image';
import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { SnackbarProvider } from 'notistack';

import * as C from '@/lib/constants';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from './context';

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

function RootTemplate({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(true);
    const [expand, setExpand] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { data: user, isLoading, mutate } = useUser();
    const pathname = usePathname();

    type ItemLinkProps<T extends ElementType> = {
        title: ReactNode;
        href: string;
        icon: ReactNode;
        LinkComponent?: T;
        LinkProps?: ComponentProps<T>
    };

    function DrawerItem<T extends ElementType>({
        title, href, icon, LinkComponent, LinkProps
    }: ItemLinkProps<T>) {
        return (
            <ListItemButton
                {...LinkProps}
                href={href}
                LinkComponent={LinkComponent ?? Link}
                selected={pathname == href}
                onClick={() => setMobileOpen(false)}
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
            <DrawerItem
                LinkComponent="a"
                LinkProps={{
                    target: '_blank'
                }}
                title={<>Docs <OpenInNewIcon sx={{ fontSize: '14px' }} /></>}
                href="https://doc.longhub.top"
                icon={<TextSnippetIcon />} />
            <Divider component="li" />
            <li>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                    Post
                </Typography>
            </li>
            <DrawerItem title="List" href="/post" icon={<FormatListBulletedIcon />} />
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
            {(!isLoading && ((user?.permission ?? 0) & C.Permission.Admin.base) != 0) &&
                <>
                    <Divider component="li" />
                    <li>
                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                            Admin
                        </Typography>
                    </li>
                    <DrawerItem title="Admin" href="/admin" icon={<SecurityIcon />} />

                </>}
        </List>
    )

    return (
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>

                <AppBar>
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            onClick={() => {
                                setOpen(!open);
                                setMobileOpen(!mobileOpen);
                            }}
                            sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                            <Link href="/">
                                L
                                <Image height={18} width={18} src="/o.png" alt="o" />
                                NG Hub
                            </Link>
                        </Typography>

                        <IconButton color="inherit" edge="end" onClick={e => {
                            setAnchorEl(e.currentTarget);
                        }}>
                            <AccountCircle />
                        </IconButton>

                        <Menu
                            disableScrollLock
                            anchorEl={anchorEl}
                            keepMounted
                            open={!!anchorEl}
                            anchorOrigin={{
                                horizontal: 'right',
                                vertical: 'bottom'
                            }}
                            transformOrigin={{
                                horizontal: 'right',
                                vertical: 'top'
                            }}
                            onClose={() => setAnchorEl(null)}
                        >
                            <div>
                                {
                                    isLoading &&
                                    <MenuItem>
                                        <CircularProgress />
                                    </MenuItem>
                                }
                            </div>
                            <div>
                                {(!isLoading && user?.name) &&
                                    <>
                                        <MenuItem component={Link} href="/account" onClick={() => setAnchorEl(null)}>
                                            <ListItemIcon>
                                                <AccountCircle fontSize="small" />
                                            </ListItemIcon>
                                            <b>{user.name}</b>
                                        </MenuItem>
                                        <MenuItem component="a" href="/account/logout">
                                            <ListItemIcon>
                                                <Logout fontSize="small" />
                                            </ListItemIcon>
                                            Logout
                                        </MenuItem>
                                    </>
                                }
                            </div>
                            <div>
                                {!isLoading && user?.name == null &&
                                    <>
                                        <MenuItem component={Link} href="/account/login" onClick={() => setAnchorEl(null)}>
                                            <ListItemIcon>
                                                <LoginIcon fontSize="small" />
                                            </ListItemIcon>
                                            Log in
                                        </MenuItem>
                                        <MenuItem component={Link} href="/account/signup" onClick={() => setAnchorEl(null)}>
                                            <ListItemIcon>
                                                <Logout fontSize="small" />
                                            </ListItemIcon>
                                            Sign up
                                        </MenuItem>
                                    </>
                                }
                            </div>
                        </Menu>
                    </Toolbar>
                </AppBar>
            </Box>


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
                onMouseEnter={() => setExpand(true)}
                onMouseLeave={() => setExpand(false)}>
                <Toolbar />

                {drawerContent}

            </Drawer>

            <MuiDrawer
                variant="temporary"
                disableScrollLock
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={theme => ({
                    zIndex: theme.zIndex.drawer + 1,
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
        </>
    )
}

export default function ProviderWrapper({
    children
}: {
    children: React.ReactNode
}) {
    const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const currentTheme = useMemo(
        () => createTheme({
            palette: {
                mode: preferDarkMode ? 'dark' : 'light',
            },
        }),
        [preferDarkMode]
    );

    return (
        <ThemeProvider theme={currentTheme}>
            <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
                <RootTemplate>
                    <Suspense>
                        {children}
                    </Suspense>
                </RootTemplate>
            </SnackbarProvider>
        </ThemeProvider>
    )
}