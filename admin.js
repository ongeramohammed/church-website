const cfg = window.TWMFC_REQUEST_CONFIG || {};
const tbody = document.getElementById('requestsBody');
const statusEl = document.getElementById('adminStatus');
const pinEl = document.getElementById('adminPin');
const loadBtn = document.getElementById('loadRequests');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function renderRequests(requests) {
  if (!requests.length) {
    tbody.innerHTML = '<tr><td colspan="6">No requests found yet.</td></tr>';
    return;
  }
  tbody.innerHTML = requests.map((item) => `
    <tr>
      <td>${escapeHtml(new Date(item.timestamp).toLocaleString())}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.contact)}</td>
      <td>${escapeHtml(item.type)}</td>
      <td>${escapeHtml(item.message)}</td>
      <td>${escapeHtml(item.source || item.page || 'website')}</td>
    </tr>
  `).join('');
}

function getLocalCopies() {
  try { return JSON.parse(localStorage.getItem('twmfcRequestCopies') || '[]'); }
  catch (error) { return []; }
}

function loadRequestsWithJsonp(pin) {
  return new Promise((resolve, reject) => {
    const callbackName = `twmfcInboxCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement('script');
    const separator = cfg.googleSheetsWebAppUrl.includes('?') ? '&' : '?';
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Google Web App did not answer. Redeploy Apps Script with the new JSONP doGet code.'));
    }, 15000);

    function cleanup() {
      clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Google Web App script load failed. Check deployment access is set to Anyone.'));
    };

    script.src = `${cfg.googleSheetsWebAppUrl}${separator}pin=${encodeURIComponent(pin)}&callback=${encodeURIComponent(callbackName)}&t=${Date.now()}`;
    document.body.appendChild(script);
  });
}

async function loadRequestsWithFetch(pin) {
  const separator = cfg.googleSheetsWebAppUrl.includes('?') ? '&' : '?';
  const res = await fetch(`${cfg.googleSheetsWebAppUrl}${separator}pin=${encodeURIComponent(pin)}&t=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`Google Web App returned HTTP ${res.status}`);
  return res.json();
}

async function loadRequests() {
  const localCopies = getLocalCopies();
  if (!cfg.googleSheetsWebAppUrl) {
    renderRequests(localCopies);
    statusEl.textContent = localCopies.length
      ? 'Showing backup copies from this browser only. Connect Google Sheets for the real church inbox.'
      : 'Google Sheets backend is not connected yet. No browser backup copies found.';
    return;
  }
  const pin = pinEl.value.trim();
  if (!pin) {
    statusEl.textContent = 'Enter your inbox PIN.';
    return;
  }
  statusEl.textContent = 'Loading requests...';
  try {
    // Use JSONP only. Normal browser fetch to Google Apps Script often fails because
    // Apps Script redirects to script.googleusercontent.com, which can trigger CORS
    // errors on some phones/browsers. JSONP avoids that static-site inbox problem.
    const data = await loadRequestsWithJsonp(pin);
    if (!data.ok) throw new Error(data.error || 'Could not load requests');
    renderRequests(data.requests || []);
    statusEl.textContent = `Loaded ${(data.requests || []).length} request(s).`;
  } catch (error) {
    renderRequests(localCopies);
    const message = error && error.message ? error.message : 'Unknown error';
    statusEl.textContent = `Google Sheet inbox could not open: ${message}. Showing browser backup copies only.`;
  }
}

loadBtn?.addEventListener('click', loadRequests);
pinEl?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') loadRequests();
});
renderRequests(getLocalCopies());
