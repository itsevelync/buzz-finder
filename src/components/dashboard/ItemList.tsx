import { Item } from "@/model/Item";
import FoundItemCard from "./FoundItemCard";

export default function ItemList({ items }: { items: Item[] | undefined }) {
    if (!items) {
        return <p>No items found.</p>;
    }
    return (
        <div className="p-5 m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item: Item) => (
                <FoundItemCard
                    key={item.title}
                    item={item}
                    includeMapLink={true}
                />
            ))}
        </div>
    );
}
