// 회사 업무 사이트 알림 담당 (사이트 탭이 닫혀 있어도 알림을 띄움)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: '회사 업무 사이트', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || '회사 업무 사이트', { body: d.body || '', icon: '/icon-512.png', tag: d.tag || undefined, data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { for (const w of ws) { if (w.url.startsWith(self.location.origin)) { w.focus(); w.navigate(url); return; } } return clients.openWindow(url); }));
});
