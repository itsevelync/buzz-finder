import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { dbConnect } from "@/lib/mongo";
import Navbar from '../components/navigation/Navbar';
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import './globals.css';

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
                    <div className="flex flex-row h-full w-full">
                         <Navbar />
                         <div className="pl-15">{children}</div>
                    </div>
                </NextAuthProvider>
            </body>
        </html>
    );
}
