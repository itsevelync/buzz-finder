self.addEventListener("push", function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            vibrate: [100, 50, 100],
            tag: data.tag,
            data: {
                url: data.url || "/",
                groupId: data.groupId,
                dateOfArrival: Date.now(),
                primaryKey: "2",
            },
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options),
        );
    }
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    const groupId = event.notification.data?.groupId;
    const url = event.notification.data?.url || "/";

    event.waitUntil(
        (async () => {
            // Get all active notifications
            const notifications = await self.registration.getNotifications();

            // Close all notifications from same group
            notifications.forEach((n) => {
                if (n.data?.groupId === groupId) {
                    n.close();
                }
            });

            // Focus existing window or open new one
            const windowClients = await clients.matchAll({
                type: "window",
                includeUncontrolled: true,
            });

            for (const client of windowClients) {
                if (client.url.includes(self.location.origin)) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            return clients.openWindow(url);
        })(),
    );
});
