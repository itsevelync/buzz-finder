import NavItem from "./NavItem";
import { navLinks } from "@/constants/NavLinks";

export default async function BottomBar() {
    return (
        <div className="flex w-full h-14 justify-around items-center border-t border-t-gray-300 p-3 bg-white">
            {navLinks.map((link) => (
                <NavItem
                    key={link.href}
                    name={link.name}
                    href={link.href}
                    icon={link.icon}
                    iconFill={link.iconFill}
                    direction="top"
                />
            ))}
        </div>
    );
}
