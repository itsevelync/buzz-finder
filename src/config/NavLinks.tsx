import {
    IoHomeOutline, IoHome,
    IoMapOutline, IoMap,
    IoChatboxEllipsesOutline, IoChatboxEllipses,
    IoAddCircleOutline, IoAddCircle,
} from "react-icons/io5";

export const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: IoHomeOutline, iconFill: IoHome },
    { name: "Map", href: "/map", icon: IoMapOutline, iconFill: IoMap },
    { name: "Chat", href: "/chat", icon: IoChatboxEllipsesOutline, iconFill: IoChatboxEllipses },
    { name: "Log Item", href: "/log-item", icon: IoAddCircleOutline, iconFill: IoAddCircle },
];
