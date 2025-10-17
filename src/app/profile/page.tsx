import Image from "next/image";
import Logout from "@/components/auth/Logout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";

export default async function Profile() {
    const session = await auth();

    if (!session?.user) redirect("/login");

    return (
        <><div>
            <h1>Welcome, {session?.user?.name}</h1>
            <h1>Username: {session?.user?.username}</h1>
            <h1>Email: {session?.user?.email}</h1>
            <Logout />
        </div>
        
        <div>
            <UpdateProfileForm userID={session.user._id}/>
        </div>
        
        </>
    );
}