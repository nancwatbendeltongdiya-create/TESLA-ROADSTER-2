const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

window.addEventListener('load', () => {
  setTimeout(() => $('#loader')?.classList.add('done'), 350);
});
$('#year').textContent = new Date().getFullYear();

// Mobile navigation
const nav = $('#nav'), menuToggle = $('#menuToggle');
menuToggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
});
$$('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false');
}));
const sections = $$('main section[id]');
const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    $$('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
  }
}), {rootMargin:'-35% 0px -55% 0px'});
sections.forEach(section => navObserver.observe(section));

// Scroll reveals
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), {threshold:.08});
  $$('.reveal').forEach(el => revealObserver.observe(el));
} else $$('.reveal').forEach(el => el.classList.add('visible'));

// Gallery lightbox
const lightbox = $('#lightbox'), lightboxImg = $('#lightboxImg'), lightboxCaption = $('#lightboxCaption');
let galleryItems = [], currentGalleryIndex = 0, previousFocus = null;
function refreshGalleryItems() { galleryItems = $$('[data-lightbox]').filter(el => !el.classList.contains('hidden')); }
function openLightbox(button) {
  refreshGalleryItems(); currentGalleryIndex = galleryItems.indexOf(button); if(currentGalleryIndex < 0) currentGalleryIndex = 0;
  previousFocus = document.activeElement; showLightboxItem(); lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); document.body.classList.add('locked'); $('#lightboxClose').focus();
}
function showLightboxItem() {
  const item = galleryItems[currentGalleryIndex]; if (!item) return;
  lightboxImg.src = item.dataset.lightbox; lightboxImg.alt = item.querySelector('img')?.alt || item.dataset.title || 'Gallery image';
  lightboxCaption.textContent = item.dataset.title || item.querySelector('span')?.textContent || '';
}
function closeLightbox() { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); document.body.classList.remove('locked'); lightboxImg.src=''; previousFocus?.focus(); }
$$('[data-lightbox]').forEach(item => item.addEventListener('click', () => openLightbox(item)));
$('#lightboxClose').addEventListener('click', closeLightbox);
$('#lightboxPrev').addEventListener('click', () => { currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length; showLightboxItem(); });
$('#lightboxNext').addEventListener('click', () => { currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length; showLightboxItem(); });
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') $('#lightboxPrev').click();
  if (e.key === 'ArrowRight') $('#lightboxNext').click();
});

// Gallery filters
$$('.filter').forEach(filter => filter.addEventListener('click', () => {
  $$('.filter').forEach(btn => btn.classList.toggle('active', btn === filter));
  const category = filter.dataset.filter;
  $$('.gallery-grid [data-category]').forEach(tile => tile.classList.toggle('hidden', category !== 'all' && tile.dataset.category !== category));
}));

// Interior hotspots
$$('.hotspot').forEach(button => button.addEventListener('click', () => {
  $$('.hotspot').forEach(b => b.classList.toggle('active', b === button));
  $('#hotspotInfo').textContent = button.dataset.info;
}));

// 2D concept viewer controls
const viewerCar = $('#viewerCar'), viewerImage = $('#viewerImage');
const originalViewerSrc = viewerCar.src;
const colorSources = {
  red: originalViewerSrc,
  silver: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85',
  black: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85',
  blue: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85'
};
const colorFilters = {red:'saturate(1.4) hue-rotate(-5deg)',silver:'grayscale(.7) brightness(1.12)',black:'grayscale(.65) brightness(.56)',blue:'saturate(1.4) hue-rotate(155deg)'};
$$('.swatch').forEach(swatch => swatch.addEventListener('click', () => {
  $$('.swatch').forEach(s => s.classList.toggle('selected', s === swatch));
  const color = swatch.dataset.color;
  viewerCar.src = colorSources[color]; viewerCar.style.filter = colorFilters[color];
  $('#colorNote').textContent = 'Selected: ' + color[0].toUpperCase() + color.slice(1) + ' concept';
}));
let rotated = false, zoomed = false;
$('#rotateBtn').addEventListener('click', () => {
  rotated = !rotated; viewerCar.style.transform = rotated ? 'perspective(700px) rotateY(-10deg) scale(1.04)' : '';
  $('#rotateBtn span').textContent = rotated ? 'Reset motion preview' : 'Motion preview';
});
$('#zoomBtn').addEventListener('click', () => {
  zoomed = !zoomed; viewerCar.style.transform = (zoomed ? 'scale(1.25)' : '') + (rotated && !zoomed ? ' perspective(700px) rotateY(-10deg) scale(1.04)' : '');
  $('#zoomBtn span').textContent = zoomed ? 'Zoom out' : 'Zoom image';
});
$('#resetBtn').addEventListener('click', () => {
  rotated = false; zoomed = false; viewerCar.style.transform = ''; viewerCar.style.filter = colorFilters.red;
  viewerCar.src = originalViewerSrc; $$('.swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === 'red'));
  $('#colorNote').textContent = 'Selected: Red concept'; $('#rotateBtn span').textContent = 'Motion preview'; $('#zoomBtn span').textContent = 'Zoom image';
});

// WhatsApp enquiry form: the visitor must review and manually send the message.
$('#enquiryForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget, status = $('#formStatus');
  status.textContent = ''; status.classList.remove('error');
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  if (!data.get('consent')) {
    status.textContent = 'Please agree to share your enquiry through WhatsApp.'; status.classList.add('error'); return;
  }
  const message = `NEW WEBSITE ENQUIRY\n\nName: ${data.get('name').trim()}\nEmail: ${data.get('email').trim()}\nPhone: ${data.get('phone').trim()}\nCountry: ${data.get('country')}\nEnquiry Type: ${data.get('type')}\n\nMessage:\n${data.get('message').trim()}\n\nWebsite: Tesla Roadster 2 Concept Website`;
  const whatsappUrl = 'https://wa.me/2347083526460?text=' + encodeURIComponent(message);
  status.textContent = 'Opening WhatsApp with your enquiry. Please review the message and press Send to deliver it.';
  const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    status.textContent = 'Your browser blocked the WhatsApp window. Use the WhatsApp contact link above, or email nancwatbendeltongdiya@gmail.com. Your enquiry has not been sent yet.';
  }
});
