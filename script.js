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
  if (daysOnline) daysOnline.textContent = days.toLocaleString();
  if (localTime) localTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

updateLiveInfographic();
setInterval(updateLiveInfographic, 1000);

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
