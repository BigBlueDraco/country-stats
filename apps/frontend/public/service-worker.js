self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  console.log(data);
  const title = data.title || "Push";
  const options = {
    body: data.body || "Push",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("click", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
