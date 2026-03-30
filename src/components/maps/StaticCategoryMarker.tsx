import { categories } from "@/constants/Categories";
import { MdQuestionMark } from "react-icons/md";

export default function StaticCategoryMarker({
    categoryName,
}: {
    categoryName?: keyof typeof categories | "";
}) {
    const category = categoryName ? categories[categoryName] : null;
    const Icon = category?.icon ?? MdQuestionMark;
    const pinColor = category?.color ?? "var(--buzz-blue)";

    return (
        <div className="relative mb-2">
            {/* Pin circle top with icon */}
            <div
                style={{
                    borderColor: pinColor,
                    color: pinColor,
                    outlineColor: `color-mix(in srgb, ${pinColor} 20%, transparent)`,
                }}
                className="bg-white h-15 aspect-square border-5 flex items-center justify-center
                           rounded-full font-bold text-3xl outline-3 shadow shadow-buzz-blue/60"
            >
                <Icon />
            </div>

            {/* Pin bottom tip */}
            <div
                style={{ borderColor: pinColor }}
                className={`absolute bottom-0 left-1/2 z-[-1] w-0 h-0 border-8
                    rounded-br-[3px] translate-y-1 -translate-x-1/2
                    rotate-45 scale-[1.3]`}
            />
        </div>
    );
}
