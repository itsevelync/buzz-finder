import { IconType } from "react-icons";
import { LuBadgeCheck } from "react-icons/lu";

interface StatusBannerProps {
    color?: keyof typeof alertStyles;
    icon?: IconType;
    text: string;
}

const alertStyles = {
    emerald: {
        div: "bg-emerald-50 border-emerald-200",
        icon: "text-emerald-600",
        h3: "text-emerald-900",
    },
    amber: {
        div: "bg-amber-50 border-amber-200",
        icon: "text-amber-600",
        h3: "text-amber-900",
    },
    gray: {
        div: "bg-gray-50 border-gray-200",
        icon: "text-gray-600",
        h3: "text-gray-800",
    },
};
export default function StatusBanner({
    color = "emerald",
    icon: Icon = LuBadgeCheck,
    text,
}: StatusBannerProps) {
    const alertStyle = alertStyles[color];
    
    return (
        <div className={`${alertStyle.div} items-center w-full border rounded-lg py-3 px-4 mb-2 flex gap-4`}>
            <Icon className={`${alertStyle.icon} text-lg shrink-0`} />
            <h3 className={`${alertStyle.h3} font-medium text-base leading-tight`}>
                {text}
            </h3>
        </div>
    );
}
