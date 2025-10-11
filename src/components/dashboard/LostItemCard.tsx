import { Item } from "@/model/Item";
import Image from "next/image";
import React from "react";

// const LostItemCard = ({ item }: { item: Item }) => {
//   return (
//     <div>
//       <a href={"item/" + item._id}>
//         <h2>{item.title}</h2>
//       </a>
//     </div>
//   );
// };

// export default LostItemCard;

function UserInfo() {
  return (
    <div className="flex flex-row items-center gap-2">
      <Image
        src="/default-icon.svg"
        alt="User avatar"
        width={30}
        height={30}
        className="relative overflow-hidden rounded-full"
      />
      <p className="text-xs">Username</p>
    </div>
  );
}

export default function LostItemCard() {
  return (
    <div className="rounded-lg w-full flex flex-col shadow p-3 gap-4">
      <div className="flex flex-row items-center gap-7">
        <UserInfo />
        <p className="text-xs">Date/time Here</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">Item Name</h2>
        <p className="text-sm">Item Description</p>
      </div>
      <p>Contact: email/phone/etc. here</p>
    </div>
  );
}
