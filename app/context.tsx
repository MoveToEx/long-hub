import useSWR from 'swr';

interface User {
    id: number;
    name: string;
    permission: number;
    createdAt: Date;
    accessKey: string;
};

const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.json();
};


export function useUser() {
    const { data, error, isLoading, mutate } = useSWR<User | null>('/api/account', fetcher);
    return {
        user: data,
        isLoading,
        isError: error,
        mutate
    };
}