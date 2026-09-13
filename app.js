'use strict';
const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const header = $('#header');
const dialogs = [...document.querySelectorAll('dialog')];
let lastOpener;
function openDialog(id, opener) {
  lastOpener = opener;
  const dialog = $(id);
  dialog.showModal();
  document.body.classList.add('modal-open');
  if (id === '#search-dialog') $('#search-input').focus();
}
dialogs.forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    lastOpener?.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
$('#menu-open').addEventListener('click', event => openDialog('#menu-dialog', event.currentTarget));
$('#search-open').addEventListener('click', event => { renderSearch(''); openDialog('#search-dialog', event.currentTarget); });
$('#contact-open').addEventListener('click', event => openDialog('#contact-dialog', event.currentTarget));
$('.menu-links').addEventListener('click', event => {
  if (event.target.closest('a')) $('#menu-dialog').close();
});
const sections = [...document.querySelectorAll('main > section, footer')];
let scrollFrame = false;
function updateHeader() {
  const sampleY = 55;
  const section = sections.find(el => { const r = el.getBoundingClientRect(); return r.top <= sampleY && r.bottom > sampleY; });
  header.classList.toggle('on-light', !!section?.classList.contains('light'));
  scrollFrame = false;
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(updateHeader); }
}, { passive: true });
window.addEventListener('resize', updateHeader);
updateHeader();
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); observer.observe(el); });
}
const track = $('#story-track');
const previous = $('#prev-story');
const next = $('#next-story');
function updateCarousel() {
  const max = Math.max(0, track.scrollWidth - track.clientWidth);
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= max - 2;
  const cardWidth = track.firstElementChild.getBoundingClientRect().width + 16;
  const page = Math.min(3, Math.round(track.scrollLeft / cardWidth) + 1);
  $('#slide-count').textContent = max <= 2 ? '03 / 03' : `${String(page).padStart(2, '0')} / 03`;
}
function moveStory(direction) {
  const amount = track.firstElementChild.getBoundingClientRect().width + 16;
  track.scrollBy({ left: amount * direction, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
previous.addEventListener('click', () => moveStory(-1));
next.addEventListener('click', () => moveStory(1));
track.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveStory(event.key === 'ArrowRight' ? 1 : -1); }
});
track.addEventListener('scroll', updateCarousel, { passive: true });
new ResizeObserver(updateCarousel).observe(track);
updateCarousel();
const materialDetails = [...document.querySelectorAll('.material-list details')];
materialDetails.forEach(details => details.addEventListener('toggle', () => {
  if (details.open) materialDetails.forEach(other => { if (other !== details) other.open = false; });
}));
const searchIndex = [...document.querySelectorAll('section[data-search]')].map(section => ({
  id: section.id,
  title: ({ overview: 'Our mission', materials: 'Recovered materials', technology: 'Our technology', network: 'Locations & recovery network', compliance: 'Compliance & documentation', book: 'Book a collection' })[section.id],
  text: `${section.dataset.search} ${section.textContent}`.toLowerCase()
}));
function renderSearch(query) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = searchIndex.filter(item => words.every(word => `${item.title.toLowerCase()} ${item.text}`.includes(word)));
  const container = $('#search-results');
  container.replaceChildren();
  $('#search-label').textContent = words.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Explore the website';
  if (!results.length) {
    const p = document.createElement('p');
    p.textContent = 'No matches found. Try “materials”, “locations” or “collection”.';
    container.append(p);
  }
  results.forEach(result => {
    const link = document.createElement('a');
    link.href = `#${result.id}`;
    link.textContent = result.title;
    const arrow = document.createElement('span');
    arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); link.append(arrow);
    link.addEventListener('click', () => $('#search-dialog').close());
    container.append(link);
  });
}
$('#search-input').addEventListener('input', event => renderSearch(event.target.value));
$('#search-open').addEventListener('click', () => { $('#search-input').value = ''; });
$('#enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = `Hello Solare Source,\n\nI'd like to enquire about a solar panel collection.\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nCollection location: ${data.get('location')}\nApproximate panel count: ${data.get('panels')}\n\nAdditional details:\n${data.get('notes') || 'None provided'}\n\nThank you.`;
  const url = `mailto:info@srcorp.com.au?subject=${encodeURIComponent('Solar panel collection enquiry')}&body=${encodeURIComponent(body)}`;
  const retry = $('#email-retry');
  retry.href = url; retry.hidden = false;
  $('#form-status').textContent = 'Your enquiry is ready. Send it from your email app to complete your request. If an email app did not open, use the link below or call +61 477 254 152.';
  window.location.href = url;
});
$('#year').textContent = new Date().getFullYear();
