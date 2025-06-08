import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ConfigItems } from "./components";

import SettingsIcon from '@mui/icons-material/Settings';

import _ from "lodash";
import { getAll } from "@/lib/config";

export default async function ConfigTab() {
    const conf = await getAll();

    return (
        <Box>
            <Typography
                sx={{ mb: 2 }}
                variant="h5"
                className="flex flex-row items-center gap-2">
                <SettingsIcon />
                Site configuration
            </Typography>
            <ConfigItems conf={conf} />
        </Box>
    )
}