'use client';

import './globals.css'
import { styled } from '@mui/material/styles';
import { useState, useMemo, Suspense, ReactNode, ElementType, ComponentProps, FunctionComponent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography, { TypographyProps } from '@mui/material/Typography';
import MuiDrawer from '@mui/material/Drawer';
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

import { SvgIconProps } from '@mui/material/SvgIcon';
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

import { SnackbarProvider } from 'notistack';

import * as C from '@/lib/constants';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from './context';

const drawerWidth = 256;

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
    whiteSpace: 'nowrap',
    zIndex: theme.zIndex.drawer + 2,
    '& .MuiDrawer-paper': {
        width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
        overflowX: 'hidden',
        maxWidth: '100%',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.standard,
        })
    },
}));

const AlterableTypography = styled(Typography, {
    shouldForwardProp: prop => prop !== 'visible'
})<TypographyProps & {
    visible: Boolean
}>(({ theme, visible }) => ({
    height: visible ? '20px' : 0,
    overflow: 'hidden',
    marginTop: visible ? theme.spacing(0.5) : 0,
    transition: theme.transitions.create(['height', 'margin-top'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.standard,
    }),
}));

function RootTemplate({
    children,
}: {
    children: ReactNode
}) {
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { data: user, isLoading } = useUser();
    const pathname = usePathname();

    type ItemLinkProps<T extends ElementType> = {
        title: ReactNode;
        href: string;
        IconComponent: FunctionComponent<SvgIconProps>;
        LinkComponent?: T;
        LinkProps?: ComponentProps<T>
    };

    function DrawerItem<T extends ElementType>({
        title, href, IconComponent, LinkComponent, LinkProps
    }: ItemLinkProps<T>) {
        return (
            <ListItemButton
                {...LinkProps}
                href={href}
                LinkComponent={LinkComponent ?? Link}
                selected={pathname == href}
                onClick={() => setMobileOpen(false)}
            >
                <ListItemIcon><IconComponent color={pathname == href ? 'primary' : undefined} /></ListItemIcon>
                <ListItemText primary={title} />
            </ListItemButton>
        )
    }

    const drawerContent = (
        <List>
            <DrawerItem title="Home" href="/" IconComponent={Home} />
            <DrawerItem title="Tag" href="/tag" IconComponent={TagIcon} />
            <DrawerItem
                LinkComponent="a"
                LinkProps={{
                    target: '_blank'
                }}
                title={<>Docs <OpenInNewIcon sx={{ fontSize: '14px' }} /></>}
                href="https://doc.longhub.top"
                IconComponent={TextSnippetIcon} />
            <Divider component="li" />
            <AlterableTypography visible={open} component="li" variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Post
            </AlterableTypography>
            <DrawerItem title="Upload" href="/post/upload" IconComponent={FileUploadIcon} />
            <DrawerItem title="Search" href="/post/search" IconComponent={Search} />
            <DrawerItem title="Find similar" href="/post/similar" IconComponent={ImageIcon} />
            <Divider component="li" />
            <AlterableTypography visible={open} component="li" variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Template
            </AlterableTypography>
            <DrawerItem title="List" href="/template" IconComponent={FormatListBulletedIcon} />
            <DrawerItem title="Upload" href="/template/upload" IconComponent={FileUploadIcon} />
            {(!isLoading && ((user?.permission ?? 0) & C.Permission.Admin.base) != 0) &&
                <>
                    <Divider component="li" />
                    <AlterableTypography visible={open} component="li" variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Admin
                    </AlterableTypography>
                    <DrawerItem title="Admin" href="/admin" IconComponent={SecurityIcon} />
                </>
            }
        </List>
    )

    return (
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar sx={theme => ({ zIndex: theme.zIndex.drawer + 1 })}>
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
                                {isLoading &&
                                    <MenuItem>
                                        <CircularProgress />
                                    </MenuItem>
                                }
                            </div>
                            <div>
                                {user &&
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
                                {user === undefined &&
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
                open={open}
                sx={theme => ({
                    [theme.breakpoints.down('md')]: {
                        display: 'none'
                    }
                })}>
                <Toolbar />
                {drawerContent}
            </Drawer>

            <MuiDrawer
                variant="temporary"
                disableScrollLock
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        display: 'none'
                    }
                })}>
                <Toolbar />
                <Box sx={{ width: drawerWidth }}>
                    {drawerContent}
                </Box>
            </MuiDrawer>

            <Box
                component="main"
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        ml: open ? `${drawerWidth}px` : theme.spacing(7),
                    },
                    transition: theme.transitions.create(['margin'], {
                        easing: theme.transitions.easing.easeInOut,
                        duration: theme.transitions.duration.standard,
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
    children: ReactNode
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
            <SnackbarProvider
                maxSnack={5}
                autoHideDuration={2000}>
                <RootTemplate>
                    <Suspense>
                        {children}
                    </Suspense>
                </RootTemplate>
            </SnackbarProvider>
        </ThemeProvider>
    )
}