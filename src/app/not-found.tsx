import Link from 'next/link';

export default async function NotFound() {
    return (
        <div>
            <h2>Error 404: Not Found</h2>
            <p>Could not find the resource you were looking for</p>
            <Link href="/">Click here to return home</Link>
        </div>
    );
}