import { useInstall } from "@/context/InstallContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiFillAndroid, AiFillApple, AiOutlineDesktop } from "react-icons/ai";
import {
    LuArrowRight,
    LuBell,
    LuChevronDown,
    LuDownload,
    LuFileQuestion,
    LuMapPin,
    LuMapPinned,
    LuMegaphone,
    LuMonitor,
    LuShare,
    LuSparkles,
    LuSquarePlus,
} from "react-icons/lu";
import { MdInstallDesktop } from "react-icons/md";

export default function AboutTab() {
    const { isStandalone, canInstall, isIOS, isAndroid, install } =
        useInstall();
    const [installDevice, setInstallDevice] = useState(
        isIOS ? "ios" : isAndroid ? "android" : "desktop",
    );

    const iOSButtonStyle =
        "my-1 font-medium bg-foreground/2 align-middle mx-1.5 inline-flex gap-1 items-center justify-center " +
        "border border-foreground/30 text-xs px-1.5 py-0.5 rounded";

    useEffect(() => {
        setInstallDevice(isIOS ? "ios" : isAndroid ? "android" : "desktop");
    }, [isIOS, isAndroid]);

    const coreFeatures = [
        {
            icon: <LuMapPin />,
            title: "Found Items Map",
            desc: "Interactive map displaying reported items.",
            href: "/map",
        },
        {
            icon: <LuBell />,
            title: "Real-Time Messaging and Alerts",
            desc: "Receive alerts and updates about your items.",
            href: "/messages",
        },
        {
            icon: <LuMegaphone />,
            title: "Streamlined Item Reporting",
            desc: "Easily report lost items or post found items.",
            href: "/report-item",
        },
    ];

    const reportItemCards = [
        {
            title: "I Lost an Item",
            href: "/report-item?type=lost",
            icon: <LuFileQuestion />,
            text: (
                <>
                    Report a <b className="text-foreground">Lost Item</b> to ask
                    the community for help finding your lost item.
                </>
            ),
            color: "blue",
            cta: "Report a Lost Item",
        },
        {
            title: "I Found an Item",
            href: "/report-item?type=found",
            icon: <LuMapPinned />,
            text: (
                <>
                    Report a <b className="text-foreground">Found Item</b> to
                    help reconnect an item you found with its owner.
                </>
            ),
            color: "gold",
            cta: "Report a Found Item",
        },
    ];

    const deviceTypes = [
        { name: "desktop", icon: <AiOutlineDesktop /> },
        { name: "ios", icon: <AiFillApple /> },
        { name: "android", icon: <AiFillAndroid /> },
    ];

    return (
        <div className="space-y-12">
            {/* About Us */}
            <div className="flex flex-col sm:flex-row gap-12 items-center">
                <div className="space-y-4 w-full sm:w-2/5 px-3">
                    <h2 className="text-3xl font-bold text-buzz-blue">
                        Reconnecting people with lost items.
                    </h2>
                    <p className="text-foreground/90">
                        BuzzFinder began as a project by college students to{" "}
                        <b className="text-foreground">
                            help students find lost items
                        </b>{" "}
                        around campus.
                    </p>
                    <p className="text-foreground/90">
                        By being a hub for item tracking, reporting, and
                        recovery, we hope that BuzzFinder allows people to{" "}
                        <b className="text-foreground">
                            reconnect with their lost items
                        </b>
                        .
                    </p>
                </div>

                {/* Core Features */}
                <div className="w-full sm:w-3/5">
                    <div className="space-y-4">
                        {coreFeatures.map((feat, idx) => (
                            <Link
                                key={idx}
                                href={feat.href}
                                className="group flex items-center gap-6 rounded-lg border border-buzz-gold/20
                                    bg-background p-5 cursor-pointer transition-all hover:-translate-y-0.5
                                    hover:border-buzz-gold/40 hover:shadow-md hover:shadow-buzz-gold/10"
                            >
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg
                                    border border-dashed border-buzz-gold/50 bg-buzz-gold/10 text-2xl text-buzz-gold
                                    transition-all duration-450 group-hover:scale-110 group-hover:rotate-6
                                    group-hover:bg-buzz-gold group-hover:text-background group-hover:border-solid"
                                >
                                    {feat.icon}
                                </div>

                                <div className="flex-1">
                                    <h4
                                        className="font-bold text-buzz-blue transition-colors duration-300
                                        group-hover:text-buzz-gold"
                                    >
                                        {feat.title}
                                    </h4>

                                    <p
                                        className="mt-1 text-foreground/75 transition-colors duration-300
                                        group-hover:text-foreground"
                                    >
                                        {feat.desc}
                                    </p>
                                </div>

                                <LuArrowRight
                                    className="text-buzz-gold opacity-0 translate-x-2 transition-all
                                    duration-300 group-hover:opacity-100 group-hover:translate-x-0
                                    group-hover:scale-125"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="border-foreground/20" />

            {/* Report an Item Section */}
            <div className="space-y-8">
                <div className="text-center">
                    <h3 className="text-3xl font-bold text-buzz-blue">
                        <LuSparkles className="inline-flex align-middle text-buzz-gold mr-3 mb-1" />
                        <span className="mr-3">Report an Item</span>
                        <LuSparkles className="inline-flex align-middle text-buzz-gold mb-1" />
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reportItemCards.map((card, idx) => (
                        <Link
                            key={idx}
                            href={card.href}
                            className={`bg-background border border-1.5 rounded-xl p-6 shadow
                                hover:shadow-md transition-all group flex flex-col
                                ${
                                    card.color === "blue"
                                        ? "border-buzz-blue/30 hover:border-buzz-blue"
                                        : "border-buzz-gold/30 hover:border-buzz-gold"
                                }`}
                        >
                            <div className="space-y-6 p-2">
                                <div
                                    className={`group-hover:scale-110 transition-transform w-14 h-14 text-3xl
                                        flex items-center justify-center rounded-lg
                                        ${
                                            card.color === "blue"
                                                ? " bg-buzz-blue/5 text-buzz-blue"
                                                : "bg-buzz-gold/10 text-buzz-gold"
                                        }`}
                                >
                                    {card.icon}
                                </div>
                                <div>
                                    <h4
                                        className={`font-bold text-2xl flex items-center gap-2
                                            ${
                                                card.color === "blue"
                                                    ? "text-buzz-blue"
                                                    : "text-buzz-gold"
                                            }`}
                                    >
                                        {card.title}
                                    </h4>
                                    <p className="text-foreground/90 mt-3">
                                        {card.text}
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`mt-6 pt-4 border-t border-foreground/10 text-right font-medium
                                    ${card.color === "blue" ? "text-buzz-blue" : "text-buzz-gold"}`}
                            >
                                {card.cta}{" "}
                                <LuArrowRight
                                    className="transition-all ml-2 group-hover:ml-5
                                        inline-flex align-middle"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Install App */}
            {!isStandalone && (
                <>
                    <hr className="border-foreground/20" />

                    <div className="bg-background border border-foreground/15 shadow rounded-xl p-6 md:p-8 space-y-6">
                        <Image
                            src="/images/buzzfinder-logo.png"
                            alt="BuzzFinder Logo"
                            width={80}
                            height={80}
                            className="rounded-xl shadow border border-foreground/20 mb-6"
                        />
                        <div
                            className="flex flex-col md:flex-row md:items-center justify-between
                            gap-4 border-b border-foreground/15 pb-4"
                        >
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl sm:text-2xl text-buzz-blue flex items-center gap-3">
                                    <MdInstallDesktop className="text-buzz-gold shrink-0" />
                                    Install the BuzzFinder App
                                </h3>
                                <p className="text-foreground/90">
                                    Report missing items on the go, and get
                                    real-time push alerts and live messaging
                                    notifications.
                                </p>
                            </div>

                            {/* Device Switcher Buttons */}
                            <div
                                className="flex bg-foreground/5 p-1 rounded-xl self-start md:self-center
                                border border-foreground/15 gap-1"
                            >
                                {deviceTypes.map((device) => (
                                    <button
                                        key={device.name}
                                        onClick={() =>
                                            setInstallDevice(device.name)
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-lg font-bold transition-all
                                            capitalize flex items-center gap-1 ${
                                                installDevice === device.name
                                                    ? "bg-buzz-blue text-background shadow-sm"
                                                    : "text-buzz-blue opacity-80 hover:opacity-100"
                                            }`}
                                    >
                                        {device.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Installation Instructions */}
                        <div
                            className="bg-foreground/2 border border-dashed border-foreground/15 rounded-xl
                            p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="space-y-3 flex-1">
                                {/* Desktop */}
                                {installDevice === "desktop" && (
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold text-buzz-blue flex items-center gap-3">
                                            <LuMonitor className="text-buzz-gold shrink-0" />{" "}
                                            Installing on Desktop (Chrome, Edge,
                                            etc.)
                                        </p>
                                        <p className="text-foreground/80">
                                            Click the &ldquo;Install App&rdquo;
                                            button to install the app instantly,
                                            or look for the install icon in your
                                            browser&rsquo;s URL address bar.
                                        </p>
                                    </div>
                                )}

                                {/* iOS */}
                                {installDevice === "ios" && (
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold text-buzz-blue flex items-center gap-3">
                                            <AiFillApple className="text-buzz-gold shrink-0" />{" "}
                                            Installing on iOS:
                                        </p>
                                        <ol
                                            className="text-foreground/80 list-decimal pl-5 marker:font-bold
                                            space-y-1"
                                        >
                                            <li className="pl-1">
                                                Tap the
                                                <span
                                                    className={iOSButtonStyle}
                                                >
                                                    <LuShare className="size-3" />{" "}
                                                    Share
                                                </span>
                                                button centered in your bottom
                                                browser dock toolbar.
                                            </li>
                                            <li className="pl-1">
                                                Scroll down through the prompt
                                                options context panel or tap
                                                <span
                                                    className={iOSButtonStyle}
                                                >
                                                    <LuChevronDown className="size-3" />{" "}
                                                    View more
                                                </span>{" "}
                                                if hidden.
                                            </li>
                                            <li className="pl-1">
                                                Select
                                                <span
                                                    className={iOSButtonStyle}
                                                >
                                                    <LuSquarePlus className="size-3" />{" "}
                                                    Add to Home Screen
                                                </span>
                                                and tap confirm in the upper
                                                corner.
                                            </li>
                                        </ol>
                                    </div>
                                )}

                                {/* Android */}
                                {installDevice === "android" && (
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold text-buzz-blue flex items-center gap-3">
                                            <AiFillAndroid className="text-buzz-gold shrink-0" />{" "}
                                            Installing on Android:
                                        </p>
                                        <p className="text-foreground/80">
                                            Tap the quick-install button below,
                                            or open your top-right browser menu
                                            to select “Install App”.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Install Button */}
                            {(installDevice === "desktop" ||
                                installDevice === "android") && (
                                <div className="shrink-0">
                                    <button
                                        onClick={() => {
                                            if (canInstall) {
                                                install();
                                            } else {
                                                alert(
                                                    "Your browser hasn't primed the installation hook yet. " +
                                                        "Look for the screen/plus icon directly inside your " +
                                                        "URL address bar to install BuzzFinder!",
                                                );
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-buzz-blue
                                            text-background font-bold shadow-md hover:shadow-lg
                                            hover:brightness-90 transition-all active:scale-95"
                                    >
                                        <LuDownload />
                                        Install App
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
