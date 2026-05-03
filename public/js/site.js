const toggle = document.querySelector('[data-mobile-toggle]');
const menu = document.querySelector('.menu');
if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('open'));

const lb = document.querySelector('.lightbox');
if (lb) {
  const img = lb.querySelector('img');
  document.querySelectorAll('[data-lightbox-src]').forEach((el) => {
    el.addEventListener('click', () => {
      img.src = el.getAttribute('data-lightbox-src');
      img.alt = el.getAttribute('alt') || '';
      lb.classList.add('active');
    });
  });
  lb.addEventListener('click', () => lb.classList.remove('active'));
}

document.querySelectorAll('[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-filter');
    document.querySelectorAll('[data-item-category]').forEach((item) => {
      item.style.display = key === 'all' || item.getAttribute('data-item-category').includes(key) ? '' : 'none';
    });
  });
});
