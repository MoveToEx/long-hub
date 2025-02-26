import { useUser } from '@/app/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function RequiresLogin({
    permission = 0
}: {
    permission?: number 
}) {
    const { data, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (data === undefined && isLoading === false) {
            router.push('/account/login');
            return;
        }
        
    }, [data, isLoading, router]);

    return <></>;
}