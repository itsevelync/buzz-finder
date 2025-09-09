import { doLogout } from "@/actions/User"

const Logout = () => {
    return (
        <form action={doLogout}>
            <button type="submit">Logout</button>
        </form>
    )
}

export default Logout