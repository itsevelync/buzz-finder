import { LuBox, LuHand, LuScanSearch, LuSearchX } from "react-icons/lu";

export const statuses = {
    unclaimed: {
        label: "Unclaimed",
        icon: LuScanSearch,
    },
    claimed: {
        label: "Claimed",
        icon: LuHand,
    },
    gone: {
        label: "No Longer There",
        icon: LuSearchX,
    },
    archived: {
        label: "Archived",
        icon: LuBox,
    },
};

export const STATUS_KEYS = Object.keys(statuses) as Array<
    keyof typeof statuses
>;

export type ItemStatus = keyof typeof statuses; // "unclaimed" | "claimed" | "gone"
export type StatusFilter = ItemStatus | "all";
