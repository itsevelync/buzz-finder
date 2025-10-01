import Link from "next/link";
import { IconType } from "react-icons";

type NavItemProps = {
    name: string;
    href: string;
    icon: IconType;
    iconFill?: IconType;
    size?: string;
    direction?: "right" | "bottom" | "top" | "left";
};

export default function NavIcon({ name, href, icon: Icon, iconFill: IconFill = Icon, size = "text-3xl", direction = "right" }: NavItemProps) {
    return (
        <Link key={href} href={href} className={`relative group ${size}`}>
            {/* Outline icon (default) */}
            <Icon className="group-hover:opacity-0 transition-all duration-300" />
            {/* Filled icon (shown on hover) */}
            <IconFill className="opacity-0 group-hover:opacity-100 absolute top-0 transition-all duration-300" />
            <span className={`tooltip tooltip-${direction}`}>{name}</span>
        </Link>
    );
}
