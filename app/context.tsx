import useSWR from 'swr';

const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.json();
};


export function useUser() {
    const { data, error, isLoading, mutate } = useSWR('/api/account/session', fetcher);
    return {
        user: data,
        isLoading,
        isError: error,
        mutate
    };
}