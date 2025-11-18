import { doLogout } from "@/actions/User";

export default function Logout() {
    return (
        <form action={doLogout}>
            <button type="submit">Logout</button>
        </form>
    );
};