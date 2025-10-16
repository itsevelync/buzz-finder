"use client";
import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";
import { Item } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";

export default function ItemSidebar(props: { items: Item[] }) {
    
    const { setLocation } = useLocation();
    const { setSelectedId } = useSelectedPin();

    return (
        <div className="h-full w-sm flex flex-col gap-3 overflow-y-auto p-5" >
            {props.items.map((item) =>
                <div
                    key={item._id.toString()}
                    className="cursor-pointer"
                    onClick={() => {
                        if (item.position) {
                            setLocation(item.position);
                        }
                        setSelectedId(item._id.toString());
                    }}
                >
                    <FoundItemCard 
                        item={item} includeMapLink={false} 
                    />
                </div>
            )}
        </div>
    );
}