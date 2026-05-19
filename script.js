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
  window.location.href = `mailto:info@waymakerfellowshipchurch.org?subject=${subject}&body=${body}`;

  setTimeout(() => {
    formStatus.textContent = 'If email did not open, copy the message and send it to the church email or WhatsApp.';
  }, 1500);
});


const zelleButton = document.querySelector('.copy-zelle');
if (zelleButton) {
  zelleButton.addEventListener('click', async () => {
    const details = zelleButton.dataset.zelle;
    try {
      await navigator.clipboard.writeText(details);
      zelleButton.textContent = 'Zelle details copied';
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
  service: 'Our main Sunday worship service is at 10:00 AM EAT. You can also join online through the Live section.',
  prayer: 'You can submit a confidential prayer request using the Prayer & Counselling form. The church team will follow up with you.',
  giving: 'You can give through PayPal, Zelle, or local giving. Please confirm official payment details with church leadership before sending funds.',
  contact: 'You can contact Waymaker Fellowship Church on 0722481199 or email info@waymakerfellowshipchurch.org.',
  default: 'Thank you for contacting Waymaker Fellowship Church. A team member can help with services, prayer, giving, events, and counselling. For urgent help, call 0722481199.'
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
  if (lower.includes('service') || lower.includes('time') || lower.includes('sunday')) return botReplies.service;
  if (lower.includes('prayer') || lower.includes('counsel') || lower.includes('help')) return botReplies.prayer;
  if (lower.includes('give') || lower.includes('paypal') || lower.includes('zelle') || lower.includes('offering') || lower.includes('tithe')) return botReplies.giving;
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('call') || lower.includes('location')) return botReplies.contact;
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
