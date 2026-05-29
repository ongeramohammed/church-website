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
    const res = await fetch(`${cfg.googleSheetsWebAppUrl}?pin=${encodeURIComponent(pin)}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Could not load requests');
    renderRequests(data.requests || []);
    statusEl.textContent = `Loaded ${(data.requests || []).length} request(s).`;
  } catch (error) {
    renderRequests(localCopies);
    statusEl.textContent = 'Could not load Google Sheet inbox. Showing browser backup copies only.';
  }
}

loadBtn?.addEventListener('click', loadRequests);
renderRequests(getLocalCopies());
