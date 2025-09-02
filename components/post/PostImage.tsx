import { usePost } from "@/app/context";
import CopiableImage from "../CopiableImage";
import MUISkeleton from "@mui/material/Skeleton";

export function Skeleton() {
    return <MUISkeleton variant="rectangular" height={300} />
}


export default function PostImage({ id }: { id: string }) {
    const { data, isLoading, error } = usePost(id);

    if (isLoading) {
        return <Skeleton />
    }

    if (error || !data) {
        return <span>Failed to fetch</span>
    }
    
    return (
        <CopiableImage
            src={data.imageURL}
            alt={'Post ' + id}
            loading='eager' />
    )
}