import { doLogout } from "@/actions/User";
import { useUser } from "@/context/UserContext";

interface LogoutProps {
    className: string;
}

export default function Logout({ className }: LogoutProps) {
    const { setUser } = useUser();

    async function handleSubmit() {
        setUser(null);
        await doLogout();
    }
    return (
        <form onSubmit={handleSubmit}>
            <button type="submit" className={className}>
                Logout
            </button>
        </form>
    );
}
