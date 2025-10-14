import { Item } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";

export default function ItemSidebar(props: { items: Item[] }) {
    return (
        <div className="h-full w-sm flex flex-col gap-3 overflow-y-scroll p-5" >
            {props.items.map((item) =>
                <FoundItemCard key={item._id.toString()} item={item} includeMapLink={false} />
            )}
        </div>
    );
}