import { PlainItem } from "@/model/Item";

// Filters for items that are unclaimed and unarchived (< 3 weeks old)
export function getActiveItems(items: PlainItem[]): PlainItem[] {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return items.filter(
        (item) =>
            item.status === "unclaimed" &&
            new Date(item.lostDate as string | Date) >= threeWeeksAgo,
    );
}

// Marks items older than 3 weeks as archived
export function archiveOldItems(items: PlainItem[]): PlainItem[] {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return items.map((item) => {
        if (
            item.status === "unclaimed" &&
            new Date(item.lostDate as string | Date) < threeWeeksAgo
        ) {
            return {
                ...item,
                status: "archived",
            };
        }

        return item;
    });
}
