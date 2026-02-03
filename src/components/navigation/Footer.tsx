import Image from "next/image";
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-gray-800 px-8 py-8">
            <div className="flex flex-row justify-center gap-20">
                {/*About Us*/}
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4 text-[#EFBF04]">
                        About Us
                    </h2>
                    <p className="text-white max-w-md text-xl">
                        BuzzFinder behaves like an online lost and found
                        service, enabling fellow Georgia Tech students to easily
                        report and locate lost possessions.
                    </p>
                </div>

                {/*Vertical Divider*/}
                <div className="w-px bg-gray-400"></div>

                {/*Follow Us*/}
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-6 text-[#EFBF04]">
                        Follow Us
                    </h2>
                    <ul className="text-white flex justify-center gap-4">
                        <li className="hover:text-pink-500 text-4xl">
                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                title="Instagram"
                            >
                                <FaInstagram />
                            </a>
                        </li>
                        <li className="hover:text-blue-400 text-4xl">
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                title="Facebook"
                            >
                                <FaFacebookF />
                            </a>
                        </li>
                        <li className="hover:text-blue-900 text-4xl">
                            <a
                                href="https://www.linkedin.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                title="LinkedIn"
                            >
                                <FaLinkedinIn />
                            </a>
                        </li>
                    </ul>
                </div>

                {/*Vertical Divider*/}
                <div className="w-px bg-gray-400"></div>

                {/*Quick Links*/}
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2 text-white">
                        Quick Links
                    </h2>
                    <ul className="text-[#EFBF04] space-y-1 underline text-xs">
                        <li>
                            <a
                                className="hover:text-blue-400 underline"
                                href=""
                            >
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a
                                className="hover:text-blue-400 underline"
                                href=""
                            >
                                Chat
                            </a>
                        </li>
                        <li>
                            <a
                                className="hover:text-blue-400 underline"
                                href=""
                            >
                                Map
                            </a>
                        </li>
                    </ul>
                </div>

                {/*Vertical Divider*/}
                <div className="w-px bg-gray-400"></div>

                {/*Legal*/}
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2 text-white">Legal</h2>
                    <ul className="text-[#EFBF04] space-y-1 underline text-xs">
                        <li>
                            <a
                                className="hover:text-blue-400 underline"
                                href=""
                            >
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a
                                className="hover:text-blue-400 underline"
                                href=""
                            >
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a
                                className="hover:text-blue-400 underline"
                                href=""
                            >
                                Cookie Policy
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/*Logo and Trademark*/}
            <div className="border-t border-gray-400 pt-6 text-gray-400 text-center mt-6">
                <Image
                    className="mx-auto"
                    src="/buzzfinder-logo.png"
                    alt="BuzzFinder"
                    width={100}
                    height={100}
                />
                <p className="mt-6">
                    © {currentYear} BuzzFinder. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
