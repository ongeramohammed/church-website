const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '×' : '☰';
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const prayerForm = document.getElementById('prayerForm');
const formStatus = document.getElementById('formStatus');

prayerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const contact = document.getElementById('contactInfo').value.trim();
  const type = document.getElementById('requestType').value;
  const message = document.getElementById('message').value.trim();

  const subject = encodeURIComponent(`${type} from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nContact: ${contact}\nType: ${type}\n\nMessage:\n${message}`);

  formStatus.textContent = 'Opening your email app...';
  window.location.href = `mailto:info@TWMFC.org?subject=${subject}&body=${body}`;

  setTimeout(() => {
    formStatus.textContent = 'If email did not open, copy the message and send it to info@TWMFC.org or call +1 551 330 6121.';
  }, 1500);
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

document.querySelectorAll('[data-count]').forEach((el) => animateCounter(el, Number(el.dataset.count)));

const zelleButton = document.querySelector('.copy-zelle');
if (zelleButton) {
  zelleButton.addEventListener('click', async () => {
    const details = zelleButton.dataset.zelle;
    try {
      await navigator.clipboard.writeText(details);
      zelleButton.textContent = 'Giving note copied';
    } catch (error) {
      zelleButton.textContent = details;
    }
  });
}

const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotPanel = document.querySelector('.chatbot-panel');
const chatbotClose = document.querySelector('.chatbot-close');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const botReplies = {
  service: 'The Way Maker Fellowship Church is a global online church. You can watch sermons and messages through YouTube @TWMFC.',
  prayer: 'You can submit a confidential prayer request using the Prayer & Counselling form. Our intercession team stands in the gap for prayer requests.',
  giving: 'You can support the mission through PayPal, Zelle / Bank Transfer, or Mobile Money once official details are confirmed by church leadership.',
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
let ambientAudioContext;
let ambientMaster;
let ambientNodes = [];

function stopSoftChurchMusic() {
  ambientNodes.forEach((node) => {
    try { node.stop?.(); } catch (error) {}
    try { node.disconnect?.(); } catch (error) {}
  });
  ambientNodes = [];
  if (ambientMaster) {
    ambientMaster.gain.setTargetAtTime(0.0001, ambientAudioContext.currentTime, 0.8);
  }
  if (musicToggle) {
    musicToggle.textContent = '♪ Play soft music';
    musicToggle.classList.remove('is-playing');
    musicToggle.setAttribute('aria-pressed', 'false');
  }
}

function startSoftChurchMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    if (musicToggle) musicToggle.textContent = 'Audio not supported';
    return;
  }
  ambientAudioContext = ambientAudioContext || new AudioContext();
  const ctx = ambientAudioContext;
  if (ctx.state === 'suspended') ctx.resume();
  ambientMaster = ctx.createGain();
  ambientMaster.gain.setValueAtTime(0.0001, ctx.currentTime);
  ambientMaster.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 1.6);
  ambientMaster.connect(ctx.destination);

  const chords = [[261.63, 329.63, 392.0], [220.0, 261.63, 349.23], [196.0, 246.94, 329.63], [174.61, 220.0, 261.63]];
  let chordIndex = 0;

  function playChord() {
    if (!ambientMaster) return;
    const start = ctx.currentTime;
    chords[chordIndex % chords.length].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 1.4);
      gain.gain.setTargetAtTime(0.0001, start + 5.4, 1.1);
      osc.connect(filter).connect(gain).connect(ambientMaster);
      osc.start(start);
      osc.stop(start + 8);
      ambientNodes.push(osc, gain, filter);
    });
    chordIndex += 1;
  }

  playChord();
  const interval = setInterval(playChord, 6200);
  ambientNodes.push({ stop: () => clearInterval(interval), disconnect: () => {} });
  if (musicToggle) {
    musicToggle.textContent = '❚❚ Pause soft music';
    musicToggle.classList.add('is-playing');
    musicToggle.setAttribute('aria-pressed', 'true');
  }
}

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    if (musicToggle.getAttribute('aria-pressed') === 'true') stopSoftChurchMusic();
    else startSoftChurchMusic();
  });
}
