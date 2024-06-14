import useSWR from 'swr';

interface User {
    id: number;
    name: string;
    permission: number;
    createdAt: Date;
    accessKey: string;
};

export function useUser() {
    const fetcher = async (url: string) => {
        const response = await fetch(url);
    
        if (!response.ok) {
            throw new Error(response.statusText);
        }
    
        return response.json();
    };

    return useSWR<User | undefined>('/api/account', fetcher);
}