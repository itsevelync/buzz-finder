export async function markAsRead(conversationId: string) {
    if (conversationId.startsWith("pending-")) {
        return;
    }

    try {
        const res = await fetch(
            `/api/conversations/${conversationId}/read`,
            {
                method: "POST",
            },
        );

        if (!res.ok) throw new Error("Failed to update read receipt");
    } catch (err) {
        console.error(err);
    }
};
