import LostItemPostForm from "@/components/post/LostItemPostForm";
import { auth } from "@/auth";

export default async function PostLostItem() {
    const session = await auth();

    return <LostItemPostForm session={session} />;
}
