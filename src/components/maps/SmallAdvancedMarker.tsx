import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { categories } from "@/constants/Categories";
import { PlainItem } from "@/model/Item";

export default function SmallAdvancedMarker({
    item,
    onPinClick,
}: {
    item: PlainItem;
    onPinClick: (e: google.maps.MapMouseEvent) => void;
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
                    style={{ borderColor: pinColor, color: pinColor, outlineColor: pinColor + "50" }}
                    className="bg-white border-4 flex items-center justify-center
                          h-10 aspect-square rounded-full text-lg shadow shadow-buzz-blue/60 outline-2"
                >
                    <Icon />
                </div>

                <div
                    style={{ borderColor: pinColor, outlineColor: pinColor + "50" }}
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
            className="-translate-y-[7px]"
        >
            {renderCustomPin()}
        </AdvancedMarker>
    );
}
