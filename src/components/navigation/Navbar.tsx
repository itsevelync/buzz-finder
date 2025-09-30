import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/dashboard">Dashboard </Link>
            <Link href="/map">Map </Link>
            <Link href="/chat">Chat </Link>
            <Link href="/profile">Profile </Link>
        </nav>
    );
};

export default Navbar;
