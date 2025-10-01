import Link from "next/link";

export default async function Home() {
    return (
        <div>
            <Link className="link" href="sign-up">Register</Link>
            <Link className="link" href="login">Log In</Link>
            <Link className="link" href="map">Maps</Link>
        </div>
    );
}