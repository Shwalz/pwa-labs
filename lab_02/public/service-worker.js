// Nowa wersja service workera od razu przejmuje stronę (bez czekania na zamknięcie kart).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Kliknięcie w powiadomienie: zamykamy je i otwieramy adres zapisany w "data.url".
// Jeśli okno aplikacji jest już otwarte, przywołujemy je zamiast otwierać nowe.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  const target = new URL(url, self.location.href);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (target.origin === self.location.origin) {
        for (const client of windows) {
          if ('focus' in client) {
            await client.focus();
            if (client.url !== target.href && 'navigate' in client) {
              await client.navigate(target.href);
            }
            return;
          }
        }
      }
      await self.clients.openWindow(target.href);
    })()
  );
});

// Wiadomość z serwera: oczekujemy JSON-a {"title": "...", "body": "...", "icon": "..."},
// ale obsługujemy też zwykły tekst (np. z przycisku "Push" w DevTools).
self.addEventListener('push', (event) => {
  let message = { title: 'Web Push', body: event.data ? event.data.text() : '' };
  try {
    message = event.data.json();
  } catch (err) {
    // to nie był JSON - zostaje tekst
  }

  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: message.icon || 'android.png',
      data: { url: './' },
    })
  );
});
