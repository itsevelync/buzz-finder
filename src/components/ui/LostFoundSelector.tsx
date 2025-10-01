'use client'
/**
 * This componenet selcts between viewing and creating either a foud or a lsto item
 */
import React from 'react'

const LostFoundSelector = ({lostItemsSelected,setLostItemsSelected}:{lostItemsSelected:boolean|null,setLostItemsSelected:React.Dispatch<React.SetStateAction<boolean | null>>}) => {
  return (
    <div className="flex justify-center gap-10 my-4 h-{40px}">
      <div className={lostItemsSelected?"":"border-b-amber-200 border-b-4 text-xl"} onClick={()=>setLostItemsSelected(false)}><h1>Found Items</h1></div>
      <div className={lostItemsSelected?"border-b-amber-200 border-b-4 text-xl":""} onClick={()=>setLostItemsSelected(true)}><h1>Lost Items</h1></div>
    </div>
  )
}

export default LostFoundSelector
