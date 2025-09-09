import Image from "next/image";
import Logout from "@/components/auth/Logout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await auth();

    if (!session?.user) redirect("/login");

    return (
        <div>
            <Image
                src={session?.user?.image ?? "/default-icon.svg"}
                alt={session?.user?.name ?? "User avatar"}
                width={72}
                height={72}
                className="rounded-full"
            />
            <h1>Welcome, {session?.user?.name}</h1>
            <Logout />
        </div>
    );
}