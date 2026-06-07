export const statuses = {
    unclaimed: {
        label: "Unclaimed",
    },
    claimed: {
        label: "Claimed",
    },
    gone: {
        label: "No Longer There",
    },
};

export const STATUS_KEYS = Object.keys(statuses) as Array<
    keyof typeof statuses
>;

export type ItemStatus = keyof typeof statuses; // "unclaimed" | "claimed" | "gone"
export type StatusFilter = ItemStatus | "all";
