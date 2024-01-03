import Stack from '@mui/material/Stack';
import TagIcon from '@mui/icons-material/Tag';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import CodeIcon from '@mui/icons-material/Code';
import ListItemIcon from '@mui/material/ListItemIcon';
import Search from '@mui/icons-material/Search';
import Link from 'next/link';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: 'Document',
        template: 'Document/%s'
    }
};


function DocEntry({
    title, href, icon
}: {
    title: string,
    href: string,
    icon: React.ReactElement
}) {
    return (
        <Stack>
            <Link href={href}>
                <ListItemButton>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={title} />
                </ListItemButton>
            </Link>
        </Stack>
    )
}

export default async function DocPage() {

    return (
        <>
            <List>
                <DocEntry title="Tag" href="/doc/tag" icon={<TagIcon />} />
                <DocEntry title="Uploading" href="/doc/uploading" icon={<FileUploadIcon />} />
                <DocEntry title="Search" href="/doc/search" icon={<Search />} />
                <DocEntry title="API" href="/doc/api" icon={<CodeIcon />} />
            </List>
        </>
    )
}