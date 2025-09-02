'use client';

import Login from '@/app/auth/login/page';
import Box from '@mui/material/Box';
import Modal from '@/components/Modal';

export default function SigninModal() {
    return (
        <Modal>
            <Box className='m-2'>
                <Login />
            </Box>
        </Modal>
    )
}