"use client";
import { useState } from "react";
import LostFoundSelector from "./LostFoundSelector";
import { Item } from "@/model/Item";
import ItemList from "./ItemList";
import useSWR from "swr";

const LostFoundDashboardContainer = () => {
    const [lostItemsSelected, setLostItemsSelected] =
        useState<boolean>(false);
    const {
        data: items,
        error,
        isLoading,
    } = useSWR<Item[]>("/api/item", (url: string) =>
        fetch(url).then((res) => res.json())
    );

    return (
        <div>
            <div className="flex flex-col justify-start align-middle w-full">
                <LostFoundSelector
                    lostItemsSelected={lostItemsSelected}
                    setLostItemsSelected={setLostItemsSelected}
                />
                {isLoading ? (
                    <div>Loading...</div>
                ) : error || items == undefined ? (
                    <div>Error loading items</div>
                ) : (
                    <></>
                )}
                {!error && !isLoading ? (
                    <ItemList
                        items={
                            items?.filter(
                                (item) => lostItemsSelected == item.isLost
                            ) ?? []
                        }
                        lostItemsSelected={lostItemsSelected}
                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

export default LostFoundDashboardContainer;
