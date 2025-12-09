'use client';

import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import { usePost } from '@/app/context';
import { RequestStatus } from '@/lib/schema';

const RequestIcon = {
    'pending': <HourglassBottomIcon />,
    'cancelled': <CancelIcon />,
    'approved': <CheckCircleIcon />,
    'revoked': <UndoIcon />,
    'dismissed': <BlockIcon />
}

export function Skeleton() {
    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary>
                <Typography variant="h6">Deletion requests</Typography>
                <div className="flex flex-1 flex-row justify-end items-center">
                    <CircularProgress size={28} />
                </div>
            </AccordionSummary>
        </Accordion>
    )
}

export default function DeletionRequests({
    id
}: {
    id: string
}) {
    const { data, isLoading, error } = usePost(id);

    if (isLoading) {
        return <Skeleton />
    }

    if (error || !data) {
        return <span>Failed to fetch</span>
    }
    
    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Deletion requests</Typography>
                <Typography color="textSecondary" className="flex-1 self-center text-right">
                    {data.deletion_requests.length}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {data.deletion_requests.map(request => (
                    <Box key={request.id} className="flex items-stretch">
                        <Box className="self-center" sx={{ m: 1 }}>
                            <Tooltip title={request.status}>
                                {RequestIcon[request.status]}
                            </Tooltip>
                        </Box>
                        <Box>
                            <Typography variant="body1" fontWeight={request.status === RequestStatus.approved ? 600 : 400}>
                                Reason: {request.reason}
                            </Typography>
                            <Typography variant="subtitle2">
                                Created at {request.createdAt} by {request.user.name}
                            </Typography>
                        </Box>
                    </Box>
                ))}
                <Typography variant="subtitle2" className="text-right" color="textSecondary" sx={{ mt: 2 }}>
                    You can create, modify or cancel your request on &apos;Request deletion&apos; page.
                </Typography>
            </AccordionDetails>
        </Accordion>
    )
}