import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { dbConnect } from "@/lib/mongo";
import Navbar from "@/components/navigation/Navbar";
import TopBar from "@/components/navigation/TopBar";
import BottomBar from "@/components/navigation/BottomBar";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastContainer } from "react-toastify";
import { ModalProvider } from "@/context/ModalContext";
import Modal from "@/components/ui/Modal";

export const viewport: Viewport = {
    initialScale: 1,
    width: "device-width",
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
            <body className={`${monaSans.variable} antialiased`}>
                <NextAuthProvider>
                    <ModalProvider>
                        <div className="h-full w-full flex flex-col">
                            <div className="top-0 w-full md:hidden z-100">
                                <TopBar />
                            </div>
                            <div className="hidden md:flex flex-row z-100">
                                <Navbar />
                            </div>
                            <div id="children-outer-container" className="md:pl-15 md:py-0 w-full grow overflow-y-auto">
                                {children}
                                <ToastContainer />
                            </div>
                            <div className="bottom-0 w-full md:hidden z-100">
                                <BottomBar />
                            </div>
                        </div>
                        <Modal />
                    </ModalProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}
