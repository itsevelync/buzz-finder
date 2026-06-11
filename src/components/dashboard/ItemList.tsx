import { PlainItem } from "@/model/Item";
import FoundItemCard from "./FoundItemCard";
import { LuCompass } from "react-icons/lu";

export default function ItemList({
    items,
}: {
    items: PlainItem[] | undefined;
}) {
    if (!items || items.length === 0) {
        return (
            <div className="p-12 flex flex-col gap-4 items-center">
                <div className="rounded-full p-4 border-2 border-foreground/20">
                    <LuCompass size={60} />
                </div>
                <p className="text-lg">No found items yet</p>
            </div>
        );
    }
    return (
        <div className="p-5 m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item: PlainItem) => (
                <FoundItemCard
                    key={item._id}
                    item={item}
                    includeMapLink={true}
                />
            ))}
        </div>
    );
}
