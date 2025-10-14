import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { dbConnect } from "@/lib/mongo";
import Navbar from '@/components/navigation/Navbar';
import TopBar from '@/components/navigation/TopBar';
import BottomBar from "@/components/navigation/BottomBar";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import './globals.css';

export const viewport: Viewport = {
    initialScale: 1,
    width: 'device-width',
    maximumScale: 1,
};

const monaSans = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "BuzzFinder",
    description: "GT Lost and Found",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await dbConnect();
    return (
        <html lang="en">
            <body
                className={`${monaSans.variable} antialiased`}
            >
                <NextAuthProvider>
                    <div className="h-full w-full flex flex-col">
                        <div className="top-0 w-full md:hidden z-100">
                            <TopBar />
                        </div>
                        <div className="hidden md:flex flex-row z-100">
                            <Navbar />
                        </div>
                        <div className="md:pl-15 md:py-0 w-full grow overflow-y-auto">{children}</div>
                        <div className="bottom-0 w-full md:hidden z-100">
                            <BottomBar />
                        </div>
                    </div>
                </NextAuthProvider>
            </body>
        </html>
    );
}
