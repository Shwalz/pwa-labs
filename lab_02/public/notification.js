const permissionInfo = document.querySelector('#permission');
const hint = document.querySelector('#hint');

const setStatus = (id, text, kind = '') => {
  const el = document.querySelector(id);
  el.textContent = text;
  el.dataset.kind = kind;
};

const IOS_INSTALL_HINT =
  'iPhone/iPad (iOS 16.4+): powiadomienia działają tylko w zainstalowanej aplikacji — Safari → Udostępnij → Do ekranu początkowego, a potem uruchom z ikony.';

const supports = {
  notification: 'Notification' in window,
  serviceWorker: 'serviceWorker' in navigator,
  push: 'PushManager' in window,
  // iOS: powiadomienia działają dopiero w aplikacji dodanej do ekranu początkowego
  standalone: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
};

const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function updateSupportInfo() {
  document.querySelector('#sup-notification').dataset.ok = supports.notification;
  document.querySelector('#sup-sw').dataset.ok = supports.serviceWorker;
  document.querySelector('#sup-push').dataset.ok = supports.push;
  document.querySelector('#sup-standalone').dataset.ok = supports.standalone;

  if (isIos && !supports.standalone) {
    hint.textContent = IOS_INSTALL_HINT;
  } else if (!supports.notification) {
    hint.textContent = 'Ta przeglądarka nie obsługuje powiadomień.';
  } else if (Notification.permission === 'denied') {
    hint.textContent =
      'Powiadomienia są zablokowane dla tej strony — zresetuj uprawnienie w ustawieniach przeglądarki i odśwież stronę.';
  } else {
    hint.textContent = '';
  }
}

const unsupportedMessage = () =>
  isIos && !supports.standalone ? IOS_INSTALL_HINT : 'Ta przeglądarka nie obsługuje powiadomień.';

function updatePermissionInfo() {
  const state = supports.notification ? Notification.permission : 'brak obsługi';
  permissionInfo.textContent = state;
  permissionInfo.dataset.state = state;
  updateSupportInfo();
}

updatePermissionInfo();

document.querySelector('#enable').addEventListener('click', async () => {
  if (!supports.notification) {
    setStatus('#test-status', unsupportedMessage(), 'err');
    return;
  }
  const permission = await Notification.requestPermission();
  console.log('Uprawnienie:', permission);
  updatePermissionInfo();
  setStatus(
    '#test-status',
    permission === 'granted' ? 'Zgoda udzielona.' : 'Brak zgody na powiadomienia.',
    permission === 'granted' ? 'ok' : 'err'
  );
});

function requirePermission(statusId) {
  if (!supports.notification) {
    setStatus(statusId, unsupportedMessage(), 'err');
    return false;
  }
  if (Notification.permission !== 'granted') {
    setStatus(statusId, 'Najpierw włącz powiadomienia.', 'err');
    return false;
  }
  return true;
}

function showLocalNotification() {
  if (!requirePermission('#test-status')) return;

  try {
    const notification = new Notification('Title', {
      body: 'Message body',
      icon: 'android.png',
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    setStatus('#test-status', 'Powiadomienie ze strony wysłane.', 'ok');
  } catch (err) {
    // np. Chrome na Androidzie: "Illegal constructor" - tam działa tylko powiadomienie z service workera
    setStatus('#test-status', 'Ta przeglądarka nie obsługuje new Notification(): ' + err.message, 'err');
  }
}

document.querySelector('#local').addEventListener('click', showLocalNotification);

if (supports.serviceWorker) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .catch((err) => console.error('Błąd rejestracji service workera:', err));
}

async function showSwNotification() {
  if (!requirePermission('#test-status')) return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Powiadomienie z service workera', {
    body: 'Kliknij, aby otworzyć stronę uczelni.',
    icon: 'android.png',
    data: { url: 'https://www.uws.edu.pl' },
  });
  setStatus('#test-status', 'Powiadomienie z service workera wysłane.', 'ok');
}

document.querySelector('#sw').addEventListener('click', showSwNotification);

// Formularz: własny tytuł, treść i ikona. Powiadomienie pokazuje service worker,
// dzięki czemu działa także na Androidzie.
const customForm = document.querySelector('#custom');

customForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = customForm.title.value.trim();
  if (!title) {
    // pole jest required, ale puste spacje przeglądarka przepuści
    customForm.title.setCustomValidity('Podaj tytuł powiadomienia.');
    customForm.title.reportValidity();
    setStatus('#form-status', 'Tytuł jest wymagany.', 'err');
    return;
  }

  if (!requirePermission('#form-status')) return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body: customForm.body.value.trim(),
    icon: customForm.icon.value,
    data: { url: './' },
  });
  setStatus('#form-status', 'Powiadomienie wysłane.', 'ok');
});

customForm.title.addEventListener('input', () => customForm.title.setCustomValidity(''));

const VAPID_PUBLIC_KEY = 'BFRJq-YvglXE4zLUOYdJXChhlpExnCAf5uoRnabBht81LeKFdhL5yzcwauy5pqwEYR9Qgd_d9Bhof7lasuICIgE';
const subscriptionField = document.querySelector('#subscription');

// Klucz VAPID jest zapisany w base64url, a pushManager.subscribe() oczekuje tablicy bajtów.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

// Po odświeżeniu pokazujemy subskrypcję, jeśli przeglądarka już ją ma.
if (supports.serviceWorker && supports.push) {
  navigator.serviceWorker.ready
    .then((registration) => registration.pushManager.getSubscription())
    .then((subscription) => {
      if (subscription) {
        subscriptionField.value = JSON.stringify(subscription, null, 2);
      }
    })
    .catch(() => {});
}

async function subscribePush() {
  if (!supports.push) {
    setStatus(
      '#push-status',
      isIos && !supports.standalone ? IOS_INSTALL_HINT : 'Ta przeglądarka nie obsługuje Web Push.',
      'err'
    );
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      // Jeśli użytkownik jeszcze nie wyraził zgody, przeglądarka zapyta o nią teraz.
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch (err) {
      setStatus('#push-status', 'Nie udało się zasubskrybować: ' + err.message, 'err');
      return;
    } finally {
      updatePermissionInfo();
    }
  }
  subscriptionField.value = JSON.stringify(subscription, null, 2);
  setStatus('#push-status', 'Subskrypcja gotowa — skopiuj ją do subscription.json.', 'ok');
}

async function unsubscribePush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
  subscriptionField.value = '';
  setStatus('#push-status', 'Subskrypcja anulowana.', '');
}

document.querySelector('#subscribe').addEventListener('click', subscribePush);
document.querySelector('#unsubscribe').addEventListener('click', unsubscribePush);
document.querySelector('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(subscriptionField.value);
    setStatus('#push-status', 'Skopiowano subskrypcję do schowka.', 'ok');
  } catch (err) {
    // brak dostępu do schowka - zaznaczamy tekst, żeby skopiować go ręcznie (Ctrl+C)
    subscriptionField.select();
    setStatus('#push-status', 'Nie udało się skopiować — tekst jest zaznaczony, skopiuj go ręcznie.', 'err');
  }
});
