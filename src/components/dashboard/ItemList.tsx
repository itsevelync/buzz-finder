import { PlainItem } from "@/model/Item";
import FoundItemCard from "./FoundItemCard";

export default function ItemList({
    items,
}: {
    items: PlainItem[] | undefined;
}) {
    if (!items) {
        return <p>No items found.</p>;
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
