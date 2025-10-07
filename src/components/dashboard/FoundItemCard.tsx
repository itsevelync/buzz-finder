import { Item } from '@/model/Item'
import React from 'react'
import Iamge from 'next/image'
const FoundItemCard = ({item,includeMapLink=true}:{item:Item,includeMapLink:boolean}) => {
    console.log(item.image)
  return (
    <div className="border-2 border-blue-500 bg-blue-900 rounded-lg w-full flex flex-col justify-between">
          <img className="w-70 h-50 max-h-full p-1 object-cover" src={item.image??""} alt="preview" height={78} width={78} />
      <div className=" h-30 w-full text-black flex flex-col justify-start align-middle pl-1">
       <a href={"item/" + item._id}> <h2 className="font-bold text-lg hover:underline hover:text-blue-500">{item.title}</h2></a>
        <h3>{item.location_details}</h3>
        <p className="text-sm">{new Date(item.lostdate).toLocaleDateString() + " " + new Date(item.lostdate).toLocaleTimeString()}</p>
        <p>{item.retrieval_description}</p>
        {includeMapLink?<a href={'map?itemId='+item._id}><button className="bg-blue-500 text-white rounded-md px-2 py-1 hover:bg-blue-600 mt-2" >See on the Map</button></a>:<></>}
      </div>
        
    </div>
  )
}

export default FoundItemCard
