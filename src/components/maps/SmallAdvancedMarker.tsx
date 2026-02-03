import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { categories } from "@/constants/Categories";
import { PlainItem } from "@/model/Item";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import Link from "next/link";

export default function SmallAdvancedMarker({
    item,
    onPinClick,
    selectedId,
    setSelectedId,
}: {
    item: PlainItem;
    onPinClick: (e: google.maps.MapMouseEvent) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
}) {
    const position = {
        lat: item.position?.lat ?? 33.778,
        lng: item.position?.lng ?? -84.398,
    };

    const category = categories[item.category];
    const Icon = category.icon;
    const pinColor = category.color;

    const renderCustomPin = () => {
        return (
            <>
                <div
                    style={{
                        borderColor: pinColor,
                        color: pinColor,
                        outlineColor: pinColor + "50",
                    }}
                    className={`bg-white border-4 flex shadow shadow-buzz-blue/60 outline-2
                        transition-all duration-300 ease-in-out group relative
                          ${
                              selectedId === item._id
                                  ? "rounded-lg flex-col gap-2 p-3 w-70 cursor-auto"
                                  : `h-10 aspect-square rounded-3xl text-lg items-center justify-center
                                     hover:h-14 hover:rounded-4xl`
                          }`}
                >
                    {selectedId === item._id ? (
                        <>
                            <div className="flex justify-between">
                                <h1 className="text-lg font-bold">
                                    {item.title}
                                </h1>
                                <IoClose
                                    className="text-2xl cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(null);
                                    }}
                                />
                            </div>
                            <Image
                                height={200}
                                width={250}
                                src={item.image?.url || "/img-placeholder.jpg"}
                                alt={`${item.title} Image`}
                                className="rounded w-full max-h-50 object-cover"
                            />
                            <div>
                                <p className="text-base">
                                    {item.item_description}
                                </p>
                                <p className="text-xs opacity-80">
                                    Reported on:{" "}
                                    {new Date(
                                        item.lostdate
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <Link href={"/item/" + item._id}>
                                <button
                                    style={{ backgroundColor: pinColor }}
                                    className="w-full text-sm text-background rounded-full px-2 py-1
                                               transition-all hover:opacity-80"
                                >
                                    See Item Details
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Image
                                width={50}
                                height={50}
                                src={item.image?.url ?? "/img-placeholder.jpg"}
                                alt={`${item.title} photo`}
                                className={`w-full h-full object-cover rounded-full
                                            group-hover:brightness-100 brightness-0 group-hover:invert-0 invert
                                           `}
                            />
                            <Icon className="absolute group-hover:opacity-0" />
                        </>
                    )}
                </div>

                <div
                    style={{
                        borderColor: pinColor,
                        outlineColor: pinColor + "50",
                    }}
                    className="absolute bottom-0 left-1/2 z-[-1] w-0 h-0 border-8
                               rounded-br-[3px] translate-y-1 -translate-x-1/2
                               rotate-45 shadow-buzz-blue/60 outline-2"
                />
            </>
        );
    };

    return (
        <AdvancedMarker
            position={position}
            title={item.title}
            clickable={true}
            onClick={onPinClick}
            zIndex={selectedId === item._id ? 1000 : 0}
            className="-translate-y-[7px]"
        >
            {renderCustomPin()}
        </AdvancedMarker>
    );
}
