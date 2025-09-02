import Signup from '@/app/auth/signup/page';
import Box from '@mui/material/Box';
import Modal from '@/components/Modal';

export default function SignupModal() {
    return (
        <Modal>
            <Box className='m-2'>
                <Signup />
            </Box>
        </Modal>
    )
}