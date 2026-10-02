self.addEventListener("push", function (event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();

  const title =
    data.title || "Central de TI - Grau Cabo";

  const options = {
    body:
      data.body || "Novo chamado recebido.",

    icon: "/icon-192.png",

    badge: "/icon-192.png",

    tag:
      data.tag || "ti-ticket",

    renotify: true,

    requireInteraction: true,

    data: {
      url:
        data.url || "/tech",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/tech";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(function (clientList) {
          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(url);
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
);