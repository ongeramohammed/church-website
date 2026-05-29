const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '×' : '☰';
  });
}

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

const requestForms = document.querySelectorAll('.request-form, #prayerForm');
const requestConfig = window.TWMFC_REQUEST_CONFIG || {};
const requestStoreKey = 'twmfcRequestCopies';

function getRequestFormData(form) {
  const name = form.querySelector('[name="name"], #name')?.value.trim() || '';
  const contact = form.querySelector('[name="contact"], #contactInfo')?.value.trim() || '';
  const type = form.querySelector('[name="type"], #requestType')?.value || form.dataset.formName || 'Website request';
  const message = form.querySelector('[name="message"], #message')?.value.trim() || '';
  return {
    name,
    contact,
    type,
    message,
    page: window.location.pathname.split('/').pop() || 'index.html',
    source: 'TWMFC website',
    timestamp: new Date().toISOString()
  };
}

function saveLocalRequestCopy(data) {
  try {
    const existing = JSON.parse(localStorage.getItem(requestStoreKey) || '[]');
    existing.unshift(data);
    localStorage.setItem(requestStoreKey, JSON.stringify(existing.slice(0, 100)));
  } catch (error) {
    // Local browser storage is only a backup copy; ignore if blocked.
  }
}

function updateWhatsAppLink(form) {
  const link = form.querySelector('.whatsapp-request');
  if (!link) return;
  const data = getRequestFormData(form);
  const number = requestConfig.whatsappNumber || '15513306121';
  const text = encodeURIComponent(`TWMFC ${data.type}\n\nName: ${data.name}\nContact: ${data.contact}\n\nMessage:\n${data.message}`);
  link.href = `https://wa.me/${number}?text=${text}`;
}

async function sendToFormService(data) {
  const endpoint = requestConfig.formServiceEndpoint || (requestConfig.churchEmail ? `https://formsubmit.co/ajax/${requestConfig.churchEmail}` : '');
  if (!endpoint) return false;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: `${data.type} from ${data.name}`,
      _template: 'table',
      _captcha: 'false',
      name: data.name,
      contact: data.contact,
      request_type: data.type,
      message: data.message,
      page: data.page,
      timestamp: data.timestamp
    })
  });
  return response.ok;
}

async function sendToGoogleSheets(data) {
  const url = requestConfig.googleSheetsWebAppUrl;
  if (!url) return false;
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  });
  // no-cors responses are opaque, so reaching here means the browser accepted the request.
  return true;
}

requestForms.forEach((form) => {
  const formStatus = form.querySelector('.form-status, #formStatus');
  ['input', 'change'].forEach((eventName) => form.addEventListener(eventName, () => updateWhatsAppLink(form)));
  updateWhatsAppLink(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = getRequestFormData(form);
    if (!data.name || !data.contact || !data.message) {
      if (formStatus) formStatus.textContent = 'Please fill in your name, contact, and message.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (formStatus) formStatus.textContent = 'Sending request directly...';
    saveLocalRequestCopy(data);

    const results = [];
    try { results.push(await sendToFormService(data)); } catch (error) { results.push(false); }
    try { results.push(await sendToGoogleSheets(data)); } catch (error) { results.push(false); }

    if (results.some(Boolean)) {
      if (formStatus) formStatus.textContent = requestConfig.googleSheetsWebAppUrl
        ? 'Request sent. It has also been saved for the church inbox.'
        : 'Request sent directly to info@TWMFC.org. First-time FormSubmit use may require email confirmation.';
      form.reset();
      updateWhatsAppLink(form);
    } else {
      if (formStatus) formStatus.textContent = 'Direct sending failed. Please use the WhatsApp button or email info@TWMFC.org.';
    }
    if (submitButton) submitButton.disabled = false;
  });
});

function animateCounter(el, target, duration = 1400) {
  let start = 0;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateLiveInfographic() {
  const launchDate = new Date('2024-08-01T00:00:00');
  const now = new Date();
  const days = Math.max(1, Math.floor((now - launchDate) / 86400000));
  const daysOnline = document.getElementById('daysOnline');
  const localTime = document.getElementById('localTime');
  const timezoneSelect = document.getElementById('timezoneSelect');
  const timezoneName = document.getElementById('timezoneName');
  const selectedTimeZone = timezoneSelect?.value || 'America/New_York';
  if (daysOnline) daysOnline.textContent = days.toLocaleString();
  if (localTime) {
    localTime.textContent = now.toLocaleTimeString('en-US', {
      timeZone: selectedTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  if (timezoneSelect && timezoneName) {
    timezoneName.textContent = timezoneSelect.options[timezoneSelect.selectedIndex].text;
  }
}

updateLiveInfographic();
setInterval(updateLiveInfographic, 1000);
document.getElementById('timezoneSelect')?.addEventListener('change', updateLiveInfographic);

const heroVideo = document.querySelector('.hero-video');
const heroVideoToggle = document.getElementById('heroVideoToggle');
if (heroVideo && heroVideoToggle) {
  heroVideoToggle.addEventListener('click', async () => {
    if (heroVideo.paused) {
      try { await heroVideo.play(); } catch (error) { return; }
      heroVideoToggle.textContent = 'Pause Video';
      heroVideoToggle.setAttribute('aria-pressed', 'false');
    } else {
      heroVideo.pause();
      heroVideoToggle.textContent = 'Play Video';
      heroVideoToggle.setAttribute('aria-pressed', 'true');
    }
  });
}

document.querySelectorAll('[data-count]').forEach((el) => animateCounter(el, Number(el.dataset.count)));

document.querySelectorAll('.copy-payment').forEach((paymentButton) => {
  paymentButton.addEventListener('click', async () => {
    const details = paymentButton.dataset.copy;
    const originalText = paymentButton.textContent;
    try {
      await navigator.clipboard.writeText(details);
      paymentButton.textContent = 'Copied';
      setTimeout(() => { paymentButton.textContent = originalText; }, 1800);
    } catch (error) {
      paymentButton.textContent = details;
    }
  });
});

const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotPanel = document.querySelector('.chatbot-panel');
const chatbotClose = document.querySelector('.chatbot-close');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const botReplies = {
  service: 'The Way Maker Fellowship Church is a global online church. You can watch sermons and messages through YouTube @TWMFC.',
  prayer: 'You can submit a confidential prayer request using the Prayer & Counselling form. Our intercession team stands in the gap for prayer requests.',
  giving: 'You can support the mission through PayPal, Zelle 551 330 6121, or M-Pesa Pay Bill 222111, Account 034000005078.',
  contact: 'Contact TWMFC by phone at +1 551 330 6121 or email info@TWMFC.org. Address: USA.',
  default: 'Thank you for contacting The Way Maker Fellowship Church. We can help with online service, prayer, giving, ministries, partnership, and contact information.'
};

function addChatMessage(text, sender = 'bot') {
  if (!chatMessages) return;
  const message = document.createElement('div');
  message.className = sender === 'user' ? 'user-message' : 'bot-message';
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('service') || lower.includes('online') || lower.includes('youtube') || lower.includes('sermon')) return botReplies.service;
  if (lower.includes('prayer') || lower.includes('counsel') || lower.includes('help')) return botReplies.prayer;
  if (lower.includes('give') || lower.includes('paypal') || lower.includes('zelle') || lower.includes('offering') || lower.includes('tithe') || lower.includes('mpesa')) return botReplies.giving;
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('call') || lower.includes('email') || lower.includes('address')) return botReplies.contact;
  return botReplies.default;
}

if (chatbotToggle && chatbotPanel) {
  chatbotToggle.addEventListener('click', () => {
    const isHidden = chatbotPanel.hasAttribute('hidden');
    chatbotPanel.toggleAttribute('hidden', !isHidden);
    chatbotToggle.setAttribute('aria-expanded', String(isHidden));
  });
}

if (chatbotClose && chatbotPanel) {
  chatbotClose.addEventListener('click', () => {
    chatbotPanel.setAttribute('hidden', '');
    chatbotToggle.setAttribute('aria-expanded', 'false');
  });
}

document.querySelectorAll('.chatbot-options button').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.reply;
    addChatMessage(button.textContent, 'user');
    setTimeout(() => addChatMessage(botReplies[key] || botReplies.default), 350);
  });
});

if (chatForm && chatInput) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage(text, 'user');
    chatInput.value = '';
    setTimeout(() => addChatMessage(getBotReply(text)), 450);
  });
}


const musicToggle = document.getElementById('musicToggle');
const softMusic = document.getElementById('softMusicAudio') || new Audio('assets/audio/soft-worship-pad.mp3');
softMusic.loop = true;
softMusic.preload = 'none';
softMusic.volume = 0.72;

function setMusicButtonPlaying(isPlaying) {
  if (!musicToggle) return;
  musicToggle.textContent = isPlaying ? '❚❚ Pause soft music' : '♪ Play soft music';
  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
}

function stopSoftChurchMusic() {
  softMusic.pause();
  setMusicButtonPlaying(false);
}

async function startSoftChurchMusic() {
  if (!musicToggle) return;
  try {
    musicToggle.textContent = 'Loading music...';
    softMusic.preload = 'auto';
    softMusic.muted = false;
    softMusic.volume = 0.72;
    await softMusic.play();
    setMusicButtonPlaying(true);
  } catch (error) {
    musicToggle.textContent = 'Tap again to play music';
    musicToggle.classList.remove('is-playing');
    musicToggle.setAttribute('aria-pressed', 'false');
  }
}

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    if (!softMusic.paused) stopSoftChurchMusic();
    else startSoftChurchMusic();
  });
}
