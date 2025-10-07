import { Item } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";

export default function ItemSidebar(props: { items: Item[] }) {
    return (
        <div className="absolute h-full w-xs z-10 bg-blue-400/50 flex flex-col overflow-y-scroll p-5" >
            {props.items.map((item) =>
                <div id={item._id.toString()} key={item._id.toString()}>
                    <FoundItemCard key={item._id.toString()} item={item} includeMapLink={false} />
                </div>
            )}
        </div>
    );
}