'use client';

import './globals.css'
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useState, useMemo, Suspense, ReactNode, ElementType, ComponentProps, FunctionComponent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography, { TypographyProps } from '@mui/material/Typography';
import MuiDrawer from '@mui/material/Drawer';
import InputBase from '@mui/material/InputBase';
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
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
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
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from './context';
import logout from './account/logout/action';

const drawerWidth = 256;

const StyledDrawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
    whiteSpace: 'nowrap',
    zIndex: theme.zIndex.drawer + 2,
    '& .MuiDrawer-paper': {
        width: open ? drawerWidth : theme.spacing(7),
        overflowX: 'hidden',
        maxWidth: '100%',
        transition: theme.transitions.create('width')
    },
}));

const AlterableTypography = styled(Typography, {
    shouldForwardProp: prop => prop !== 'visible'
})<TypographyProps & {
    visible: Boolean
}>(({ theme, visible }) => ({
    height: visible ? theme.spacing(2) : 0,
    overflow: 'hidden',
    marginTop: visible ? theme.spacing(0.5) : 0,
    transition: theme.transitions.create(['height', 'margin-top']),
}));

const SearchContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        display: 'none'
    },
    transition: theme.transitions.create('background-color', {
        duration: theme.transitions.duration.shortest
    })
}));

const SearchIconContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        transition: theme.transitions.create('width'),
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        [theme.breakpoints.up('sm')]: {
            width: '16ch',
            '&:focus': {
                width: '24ch'
            }
        }
    }
}));

function SearchBox() {
    const router = useRouter();
    const [value, setValue] = useState('');

    return (
        <SearchContainer>
            <SearchIconContainer>
                <Search />
            </SearchIconContainer>
            <SearchInput
                placeholder="Quick search"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key == 'Enter') {
                        const url = new URL('/post/search', window.location.href);
                        url.searchParams.set('s', value);
                        setValue('');
                        router.push(url.toString());
                    }
                }}
            />
        </SearchContainer>
    )
}

type DrawerItemParam = {
    type: 'item',
    icon: FunctionComponent,
    title: string,
    href: string
}

type DrawerDividerParam = {
    type: 'divider',
    title: string
}

const drawerItems: (DrawerItemParam | DrawerDividerParam)[] = [
    {
        type: 'item',
        title: 'Home',
        href: '/',
        icon: Home
    },
    {
        type: 'item',
        title: 'Docs',
        href: 'https://doc.longhub.top',
        icon: TextSnippetIcon
    },
    {
        type: 'divider',
        title: 'Post'
    },
    {
        type: 'item',
        title: 'List',
        href: '/post/list',
        icon: FormatListBulletedIcon
    },
    {
        type: 'item',
        title: 'Upload',
        href: '/post/upload',
        icon: FileUploadIcon
    },
    {
        type: 'item',
        title: 'Search',
        href: '/post/search',
        icon: Search
    },
    {
        type: 'item',
        title: 'Find similar',
        href: '/post/similar',
        icon: ImageIcon
    },
    {
        type: 'divider',
        title: 'Template'
    },
    {
        type: 'item',
        title: 'List',
        href: '/template',
        icon: FormatListBulletedIcon
    },
    {
        type: 'item',
        title: 'Upload',
        href: '/template/upload',
        icon: FileUploadIcon
    }
]

const adminDrawerItems: (DrawerItemParam | DrawerDividerParam)[] = [
    {
        type: 'divider',
        title: 'Admin'
    },
    {
        type: 'item',
        title: 'Admin',
        href: '/admin',
        icon: SecurityIcon
    },
]

function DrawerItem<T extends ElementType>({
    title, href, IconComponent, LinkComponent, LinkProps
}: {
    title: ReactNode,
    href: string,
    IconComponent: FunctionComponent<SvgIconProps>,
    LinkComponent?: T,
    LinkProps?: ComponentProps<T>
}) {
    const pathname = usePathname();
    return (
        <ListItemButton
            {...LinkProps}
            href={href}
            LinkComponent={LinkComponent ?? Link}
            selected={pathname == href}
        >
            <ListItemIcon><IconComponent color={pathname == href ? 'primary' : undefined} /></ListItemIcon>
            <ListItemText primary={title} />
        </ListItemButton>
    )
}

function Drawer({
    open,
    onClose,
}: {
    open: boolean,
    onClose: () => void,
}) {
    const user = useUser();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const content = useMemo(() => {
        let items = [
            ...drawerItems
        ];

        if (((user.data?.permission ?? 0) & C.Permission.Admin.base) != 0) {
            items = items.concat(adminDrawerItems);
        }
        return (
            <List>
                {items.map((e, i) => {
                    if (e.type == 'divider') {
                        return (
                            <div key={i}>
                                <Divider component="li" />
                                <AlterableTypography
                                    visible={open}
                                    component="li"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 2 }}>
                                    {e.title}
                                </AlterableTypography>
                            </div>
                        )
                    }
                    if (URL.canParse(e.href)) {
                        return (
                            <DrawerItem
                                key={i}
                                LinkComponent="a"
                                LinkProps={{
                                    target: '_blank'
                                }}
                                title={<>{e.title} <OpenInNewIcon sx={{ fontSize: '14px' }} /></>}
                                href={e.href}
                                IconComponent={e.icon} />
                        )
                    }
                    return (
                        <DrawerItem key={i} title={e.title} href={e.href} IconComponent={e.icon} />
                    )
                })}
            </List>
        )
    }, [user, open]);

    if (isMobile) {
        return (
            <MuiDrawer
                variant="temporary"
                disableScrollLock
                open={open}
                onClose={onClose}
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        display: 'none'
                    }
                })}>
                <Toolbar />
                <Box sx={{ width: drawerWidth }}>
                    {content}
                </Box>
            </MuiDrawer>
        )
    }
    else {
        return (
            <StyledDrawer
                variant="permanent"
                open={open}
                sx={theme => ({
                    [theme.breakpoints.down('md')]: {
                        display: 'none'
                    }
                })}>
                <Toolbar />
                {content}
            </StyledDrawer>
        )
    }
}

function UserMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { data, isLoading, mutate } = useUser();

    return (
        <>
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
                {isLoading &&
                    <MenuItem>
                        <CircularProgress />
                    </MenuItem>
                }
                {data &&
                    <div>
                        <MenuItem component={Link} href="/account" onClick={() => setAnchorEl(null)}>
                            <ListItemIcon>
                                <AccountCircle fontSize="small" />
                            </ListItemIcon>
                            <b>{data.name}</b>
                        </MenuItem>
                        <MenuItem onClick={async () => {
                            await logout();
                            await mutate();
                            setAnchorEl(null);
                        }}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </div>
                }
                {data === undefined &&
                    <div>
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
                    </div>
                }
            </Menu>
        </>
    )
}

function RootTemplate({
    children,
}: {
    children: ReactNode
}) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <CssBaseline />
            <Box className="flex">
                <AppBar sx={theme => ({ zIndex: theme.zIndex.drawer + 1 })}>
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            onClick={() => {
                                setDrawerOpen(!drawerOpen);
                            }}
                            sx={{ mr: 2 }}>
                            {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
                        </IconButton>
                        <Typography variant="h5" component="div" className="grow">
                            <Link href="/">
                                L
                                <Image height={18} width={18} className="inline align-baseline h-[18px]" src="/o.png" alt="o" />
                                NG Hub
                            </Link>
                        </Typography>
                        <SearchBox />
                        <UserMenu />
                    </Toolbar>
                </AppBar>
            </Box>


            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)} />

            <Box
                component="main"
                sx={theme => ({
                    [theme.breakpoints.up('md')]: {
                        ml: drawerOpen ? `${drawerWidth}px` : theme.spacing(7),
                    },
                    transition: theme.transitions.create(['margin'])
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