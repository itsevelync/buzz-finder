import { Item } from '@/model/Item'
import React from 'react'
import FoundItemCard from './FoundItemCard'
import LostItemCard from './LostItemCard'

const ItemList = ({items,lostItemsSelected}:{items:Item[],lostItemsSelected:boolean|null}) => {
  return (
    <div className='flex flex-row flex-wrap gap-4 justify-center align-center'>
        {lostItemsSelected?items.map((item:Item)=>(<LostItemCard key={item.title} item={item}/>)):items.map((item:Item)=>(<FoundItemCard key={item.title} item={item}/>))}
      
    </div>
  )
}

export default ItemList
