import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextAuthProvider>
                    <div className="h-full w-full">
                        <div className="fixed top-0 w-full md:hidden z-100">
                            <TopBar />
                        </div>
                        <div className="hidden md:flex flex-row">
                            <Navbar />
                        </div>
                        <div className="py-14 md:pl-15 md:py-0">{children}</div>
                        <div className="fixed bottom-0 w-full md:hidden z-100">
                            <BottomBar />
                        </div>
                    </div>
                </NextAuthProvider>
            </body>
        </html>
    );
}
