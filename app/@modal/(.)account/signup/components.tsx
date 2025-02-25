'use client';

import Modal from '@/components/Modal';

import { ReactNode } from 'react';

export default function SignupModal({
    signUpSlot
}: {
    signUpSlot: ReactNode
}) {
    return (
        <Modal>
            {signUpSlot}
        </Modal>
    )
}