import { Item } from "@/model/Item";
import React from "react";
import FoundItemCard from "./FoundItemCard";
import LostItemCard from "./LostItemCard";

const ItemList = ({
  items,
  lostItemsSelected,
}: {
  items: Item[];
  lostItemsSelected: boolean | null;
}) => {
  return (
    <div className="m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 p-5 gap-4">
      {/* {lostItemsSelected ? items.map((item: Item) => (<LostItemCard key={item.title} item={item} />)) : items.map((item: Item) => (<FoundItemCard key={item.title} item={item} includeMapLink={true}/>))} */}
      {lostItemsSelected ? (
        <LostItemCard />
      ) : (
        items.map((item: Item) => (
          <FoundItemCard key={item.title} item={item} includeMapLink={true} />
        ))
      )}
    </div>
  );
};

export default ItemList;
