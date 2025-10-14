import { Item } from '@/model/Item'
import React from 'react'
import FoundItemCard from './FoundItemCard'
import LostItemCard from './LostItemCard'

export default function ItemList({ items, lostItemsSelected }: { items: Item[], lostItemsSelected: boolean }) {
    return (
        <div className='m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
            {lostItemsSelected ? items.map((item: Item) => (<LostItemCard key={item.title} item={item} />)) : items.map((item: Item) => (<FoundItemCard key={item.title} item={item} includeMapLink={true}/>))}
        </div>
    )
}
