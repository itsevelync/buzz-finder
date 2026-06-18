import { PlainItem } from "@/model/Item";

// Fetches all items
export async function getAllItems(): Promise<PlainItem[]> {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/items`);
    if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
    return res.json();
}

// Fetches only items that are unclaimed and unarchived (< 3 weeks old)
export async function getActiveItems(): Promise<PlainItem[]> {
    const items = await getAllItems();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return items.filter(
        (item) =>
            item.status === "unclaimed" &&
            new Date(item.lostDate as string | Date) >= threeWeeksAgo
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