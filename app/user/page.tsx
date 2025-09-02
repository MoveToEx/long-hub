'use client';

import { ReactNode, useState } from "react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import AccountCircle from "@mui/icons-material/AccountCircle";
import CircularProgress from "@mui/material/CircularProgress";

import { useSession } from "../context";
import RequiresLogin from "@/components/RequiresLogin";
import { APITab, InfoTab, PreferenceTab } from "./tabs";
import { ResponsivePaper } from "../admin/components";

function IndexedTab({
    children,
    value,
    index
}: {
    children?: ReactNode,
    value: number,
    index: number
}) {
    if (value !== index) return <></>;

    return children;
}

function UserSkeleton() {
    return (
        <Box component={Paper} className='m-4 flex flex-col'>
            <RequiresLogin />
            <Typography variant="h4" sx={{ mt: 2, ml: 2 }}>
                <Skeleton />
            </Typography>

            <Divider orientation="vertical" flexItem />

            <div>
                <div className='border-b border-gray-300'>
                    <Tabs value={0}>
                        <Tab label='Info' />
                        <Tab label='API access' />
                        <Tab label='Preference' />
                    </Tabs>
                </div>

                <div className='m-4 min-h-48 flex flex-row justify-center items-center'>
                    <CircularProgress />
                </div>
            </div>
        </Box>
    );
}

export default function SelfPage() {
    const { data, isLoading } = useSession();
    const [tab, setTab] = useState(0);

    if (isLoading) {
        return <UserSkeleton />
    }

    if (!data) {
        return <span> Unexpected error </span>
    }

    return (
        <Box component={ResponsivePaper}>
            <RequiresLogin />
            <div>
                <Typography variant="h4" sx={{ mt: 2, ml: 2 }}>
                    <AccountCircle fontSize="large" />{data.name}
                </Typography>
            </div>

            <Divider orientation="vertical" flexItem />

            <div>
                <div className='border-b border-gray-300'>
                    <Tabs value={tab} onChange={(e, val) => setTab(val)}>
                        <Tab label='Info' />
                        <Tab label='API access' />
                        <Tab label='Preference' />
                    </Tabs>
                </div>

                <div className='m-4 min-h-48'>
                    <IndexedTab index={0} value={tab}>
                        <InfoTab />
                    </IndexedTab>
                    <IndexedTab index={1} value={tab}>
                        <APITab />
                    </IndexedTab>
                    <IndexedTab index={2} value={tab}>
                        <PreferenceTab />
                    </IndexedTab>
                </div>
            </div>
        </Box>
    );
}