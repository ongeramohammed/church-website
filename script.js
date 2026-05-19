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
  window.location.href = `mailto:info@newhopechurch.org?subject=${subject}&body=${body}`;

  setTimeout(() => {
    formStatus.textContent = 'If email did not open, copy the message and send it to the church email or WhatsApp.';
  }, 1500);
});
