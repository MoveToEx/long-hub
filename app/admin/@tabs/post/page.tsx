

import Box from '@mui/material/Box';
import _ from "lodash";
import { PostGrid } from "./components";
import Typography from '@mui/material/Typography';


export default function PostTab() {
    return (
        <Box>
            <Box className="flex justify-between">
                <Typography variant='h5'>
                    Posts
                </Typography>
            </Box>
            <Box sx={{
                xs: {
                    m: 0,
                },
                md: {
                    m: 2
                }
            }}>
                <PostGrid />
            </Box>
        </Box>
    )
}