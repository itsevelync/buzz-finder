import { useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { categories } from "@/constants/Categories";

import { PlainItem } from "@/model/Item";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CustomAdvancedMarker({
    item,
    disableClick = false,
}: {
    item: PlainItem;
    disableClick?: boolean;
}) {
    const router = useRouter();

    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const position = {
        lat: item.position?.lat ?? 33.778,
        lng: item.position?.lng ?? -84.398,
    };

    const updateClicked = () => {
        router.push("/map?itemId=" + item._id);
        if (!disableClick) {
            if (clicked) {
                setClicked(false);
                setHovered(false);
            } else {
                setClicked(true);
                setHovered(false);
            }
        }
    };

    const category = categories[item.category];
    const Icon = category.icon;
    const pinColor = category.color;

    const renderCustomPin = () => {
        return (
            <>
                <div
                    className={`custom-pin relative transition-all duration-200 ease-in-out
                      ${
                          clicked
                              ? "h-auto aspect-auto"
                              : hovered
                              ? "h-20 aspect-square"
                              : "h-15 aspect-square"
                      }
                    `}
                >
                    <div
                        style={{ borderColor: pinColor }}
                        className={`image-container bg-white w-full h-full transition-all
                          border-5 flex items-center justify-center overflow-hidden relative
                          ${
                              clicked
                                  ? "rounded-lg max-w-50"
                                  : "max-w-[84px] rounded-full"
                          }
                        `}
                    >
                        {!clicked ? (
                            <>
                                <Image
                                    width={50}
                                    height={50}
                                    src={
                                        item.image?.url ??
                                        "/img-placeholder.jpg"
                                    }
                                    alt="Item photo"
                                    className={`w-full h-full object-cover ${
                                        hovered ? "" : "brightness-0 invert"
                                    }`}
                                />
                                <span
                                    style={{ color: pinColor }}
                                    className={`font-bold text-3xl icon absolute
                                      ${hovered ? "opacity-0" : ""}
                                    `}
                                >
                                    <Icon />
                                </span>
                            </>
                        ) : (
                            <div className="p-3 w-50 text-base">
                                <h2 className="font-bold">Location Details</h2>
                                <p>{item.location_details ?? "N/A"}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{ borderColor: pinColor }}
                    className={`absolute bottom-0 left-1/2 z-[-1] w-0 h-0 border-8
                    rounded-br-[3px] translate-y-1 -translate-x-1/2
                    rotate-45 scale-[1.3] transition-all duration-200 ease-in-out`}
                />
            </>
        );
    };

    return (
        <AdvancedMarker
            position={position}
            title={`${item.title} Location`}
            className={`item-marker cursor-pointer relative -translate-y-[5px] transition-all duration-200 ease-in-out
              ${clicked ? " clicked" : ""}${
                hovered && !clicked ? " hovered" : ""
            }
            `}
            onClick={updateClicked}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {renderCustomPin()}
        </AdvancedMarker>
    );
}
