import { PlainItem } from "@/model/Item";

// Filters for items that are unclaimed and unarchived (< 3 weeks old)
export function getActiveItems(items: PlainItem[]): PlainItem[] {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return items.filter(
        (item) =>
            item.status === "unclaimed" &&
            !isOlderThanThreeWeeks(item.lostDate as string | Date),
    );
}

// Marks items older than 3 weeks as archived
export function archiveOldItems(items: PlainItem[]): PlainItem[] {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return items.map((item) => {
        if (
            item.status === "unclaimed" &&
            isOlderThanThreeWeeks(item.lostDate as string | Date)
        ) {
            return {
                ...item,
                status: "archived",
            };
        }

        return item;
    });
}

export function isOlderThanThreeWeeks(date: string | Date) {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return new Date(date as string | Date) < threeWeeksAgo;
}
