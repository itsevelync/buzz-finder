//basically gets rid of all archived items (manually archived, or older than 3 weeks)
import { PlainItem } from "@/model/Item";

//for general use (getting all items, even archived ones) but idk how often we'll use it
//might not even need this as a function
export async function getAllItems(): Promise<PlainItem[]> {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/item`);
    if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
    return res.json();
}

//for server-side filtering (ex. map page)
export async function getActiveItems(): Promise<PlainItem[]> {
    const items = await getAllItems();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    return items.filter(
        (item) =>
            !item.isArchived &&
            new Date(item.lostdate as string | Date) >= threeWeeksAgo
    );
}

//for client-side filtering (ex. dashboard)
export function filterActiveItems(items: PlainItem[]): PlainItem[] {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    return items.filter(
        (item) =>
            !item.isArchived &&
            new Date(item.lostdate as string | Date) >= threeWeeksAgo
    );
}
