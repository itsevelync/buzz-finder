import type { Metadata } from 'next';
import ItemModel from '@/model/Item';
import type { Item } from '@/model/Item';
import MapClient from './MapClient';

export const metadata: Metadata = {
    title: "Map - BuzzFinder",
    description: "An interactive map displaying lost items",
};

interface SearchParams {
    [key: string]: string | string[] | undefined;
}

export default async function Map({ searchParams }: { searchParams: SearchParams }) {
    //Check Search Params to see if there is a item we want to focus
    const itemId = (searchParams.itemId as string) ?? null;

    //Get all items from the database and convert them to plain Item objects
    const dbItems = await ItemModel.find().lean<Item[]>().exec();
    const items: any[] = dbItems.map(item => ({
        ...item,
        _id: item._id.toString(),
    }));

    return (
        <MapClient itemId={itemId} items={items} />
    );
};
