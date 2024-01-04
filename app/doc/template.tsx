'use client';

import React from "react";
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from "@mui/material/List";
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

function ContentLink({
    href,
    title,
    useConsolas
}: {
    href?: string,
    title: React.ReactNode,
    useConsolas?: boolean
}) {
    return (
        <ListItem sx={{ p: 0, pt: 0.5, pb: 0.5 }}>
            {href === undefined ?
                <Typography color="text.secondary" fontFamily={useConsolas ? "Consolas" : ""}>{title}</Typography> :
                <Link href={href} underline="hover" color="text.secondary" fontFamily={useConsolas ? "Consolas" : ""}>{title}</Link>
            }
        </ListItem>
    )
}

export default function DocTemplate({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Drawer variant="permanent" anchor="right">
                <Toolbar />
                <Box sx={{ minWidth: '256px', m: 2 }}>
                    <List>
                        <ListItem disablePadding>
                            Guideline
                        </ListItem>
                        <ListItem sx={{ p: 0, pl: 2 }}>
                            <List disablePadding>
                                <ContentLink href="/doc/tag" title="Tagging" />
                                <ContentLink href="/doc/upload" title="Uploading" />
                                <ContentLink href="/doc/search" title="Search" />
                            </List>
                        </ListItem>
                        <ListItem disablePadding>
                            API
                        </ListItem>
                        <ListItem sx={{ p: 0, pl: 2 }}>
                            <List disablePadding>
                                <ContentLink href="/doc/api/post" title="/post" useConsolas />
                                <ListItem sx={{ p: 0, pl: 2 }}>
                                    <List disablePadding>
                                        <ContentLink href="/doc/api/post/id" title="/[id]" useConsolas />
                                        <ContentLink href="/doc/api/post/tag" title="/tag" useConsolas />
                                        <ListItem sx={{ p: 0, pl: 2 }}>
                                            <List disablePadding>
                                                <ContentLink href="/doc/api/post/tag/name" title="/[name]" useConsolas />
                                            </List>
                                        </ListItem>
                                        <ContentLink href="/doc/api/post/search" title="/search" useConsolas />
                                        <ContentLink href="/doc/api/post/similar" title="/similar" useConsolas />
                                    </List>
                                </ListItem>
                                <ContentLink title="/template" useConsolas />
                                <ListItem sx={{ p: 0, pl: 2 }}>
                                    <List disablePadding>
                                        <ContentLink href="/doc/api/template/name" title="/[name]" useConsolas />
                                        <ListItem sx={{ p: 0, pl: 2 }}>

                                            <List disablePadding>
                                                <ContentLink href="/doc/api/template/name/generate" title="/generate" useConsolas />
                                            </List>
                                        </ListItem>
                                    </List>
                                </ListItem>
                            </List>
                        </ListItem>
                    </List>
                </Box>

            </Drawer>
            {children}
        </>
    )
}