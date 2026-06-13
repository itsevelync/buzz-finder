import { doLogout } from "@/actions/User";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";

interface LogoutProps {
    className: string;
}

export default function Logout({ className }: LogoutProps) {
    const { setUser } = useUser();

    async function handleSubmit() {
        setUser(null);
        await doLogout();
        redirect("/");
    }
    return (
        <form onSubmit={handleSubmit}>
            <button type="submit" className={className}>
                Logout
            </button>
        </form>
    );
}
