import { useSession } from '@/app/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function RequiresLogin({
    permission = 0
}: {
    permission?: number 
}) {
    const { data, isLoading } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (data === undefined && isLoading === false) {
            router.push('/auth/login');
            return;
        }
        
    }, [data, isLoading, router]);

    return <></>;
}