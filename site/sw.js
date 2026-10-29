// 회사 업무 사이트 알림 담당 (사이트 탭이 닫혀 있어도 알림을 띄움)
const SB = 'https://rccqttalxsniltuxwbyt.supabase.co', AK = 'sb_publishable_SylrJrFPnG4TIVxqUVB-jQ_jCIJYmcD';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: '회사 업무 사이트', body: e.data ? e.data.text() : '' }; }
  const opt = { body: d.body || '', icon: '/icon-512.png', tag: d.tag || undefined, requireInteraction: !!d.sticky, renotify: !!d.tag, data: { url: d.url || '/', ack: d.ack || null } };
  if (d.image) opt.icon = d.image; // 사진은 팝업 안 왼쪽 작은 그림 자리에 (큰 사진 칸은 팝업과 끊겨 보여서 안 씀)
  if (d.ack) opt.actions = [{ action: 'ack', title: '확인했어요' }, { action: 'open', title: '내용 보기' }];
  e.waitUntil(self.registration.showNotification(d.title || '회사 업무 사이트', opt));
});
async function openUrl(url) {
  const ws = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const w of ws) { if (w.url.startsWith(self.location.origin)) { await w.focus(); try { await w.navigate(url); } catch (_) {} return; } }
  return clients.openWindow(url);
}
self.addEventListener('notificationclick', e => {
  const n = e.notification, data = n.data || {}, url = data.url || '/';
  n.close();
  if (e.action === 'ack' && data.ack) {
    e.waitUntil((async () => {
      try {
        const r = await fetch(SB + '/rest/v1/rpc/notice_ack_token', { method: 'POST', headers: { apikey: AK, Authorization: 'Bearer ' + AK, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_id: data.ack.id, p_name: data.ack.name, p_token: data.ack.token }) });
        if (!r.ok) throw new Error(await r.text());
        // 성공하면 조용히 끝 (누른 사람에게는 따로 알림을 띄우지 않음)
      } catch (err) {
        await self.registration.showNotification('확인 처리에 실패했어요', { body: '사이트에서 [확인]을 눌러 주세요', icon: '/icon-512.png', tag: 'ackfail-' + data.ack.id, data: { url } });
      }
    })());
    return;
  }
  e.waitUntil(openUrl(url));
});


