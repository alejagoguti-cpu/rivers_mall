const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* 1. LOADER */
let started = false;
function start() {
  if (started) return;
  started = true;
  const loader = $('#loader');
  if (loader) loader.classList.add('done');
  document.body.classList.add('loaded');
}
window.addEventListener('load', () => setTimeout(start, 400));
setTimeout(start, 2000);

/* 2. SCROLL REVEAL */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.rv').forEach(el => io.observe(el));

/* 3. NAVBAR SCROLL & SOLID BACKGROUND */
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const nav = $('#nav');
  if (nav) {
    nav.classList.toggle('hide', y > lastY && y > 220);
    nav.classList.toggle('solid', y > 100);
  }
  lastY = y;
}, { passive: true });

/* 4. BURGER & DRAWER MOBILE */
const burger = $('#burger');
const drawer = $('#drawer');
if (burger && drawer) {
  burger.onclick = () => {
    burger.classList.toggle('open');
    drawer.classList.toggle('open');
  };
  $$('#drawer a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
    });
  });
}

/* 5. PDF.JS - RENDERIZADO INTERACTIVO DE LÁMINAS */
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdfUrl = 'assets/materiales.pdf';

  pdfjsLib.getDocument(pdfUrl).promise.then(async pdf => {
    // Lámina 1: Sanitarios & PMR
    try {
      const page1 = await pdf.getPage(1);
      const canvas1 = document.getElementById('canvas-lamina-1');
      const load1 = document.getElementById('load-1');
      if (canvas1) {
        const viewport1 = page1.getViewport({ scale: 2 });
        canvas1.width = viewport1.width;
        canvas1.height = viewport1.height;
        await page1.render({
          canvasContext: canvas1.getContext('2d'),
          viewport: viewport1
        }).promise;
        if (load1) load1.classList.add('hide');
      }
    } catch (err) {
      console.warn('Error al procesar Lámina 1:', err);
    }

    // Lámina 2: Moodboard Materiales
    try {
      const page2 = await pdf.getPage(2);
      const canvas2 = document.getElementById('canvas-lamina-2');
      const load2 = document.getElementById('load-2');
      if (canvas2) {
        const viewport2 = page2.getViewport({ scale: 2 });
        canvas2.width = viewport2.width;
        canvas2.height = viewport2.height;
        await page2.render({
          canvasContext: canvas2.getContext('2d'),
          viewport: viewport2
        }).promise;
        if (load2) load2.classList.add('hide');
      }
    } catch (err) {
      console.warn('Error al procesar Lámina 2:', err);
    }
  }).catch(err => {
    console.warn('Aviso PDF.js:', err);
  });
}

/* 6. MATRIZ DE MATERIALES: FILTROS & BÚSQUEDA EN TIEMPO REAL */
(function initMatrix() {
  const filterChips = $$('.category-filters .filter-chip');
  const searchInput = $('#matrix-search');
  const rows = $$('#matrix-table tbody tr');

  let currentCategory = 'all';
  let currentSearch = '';

  function applyFilters() {
    rows.forEach(row => {
      const cat = row.dataset.cat;
      const text = row.textContent.toLowerCase();

      const matchCategory = (currentCategory === 'all' || cat === currentCategory);
      const matchSearch = (!currentSearch || text.includes(currentSearch));

      if (matchCategory && matchSearch) {
        row.classList.remove('row-hidden');
      } else {
        row.classList.add('row-hidden');
      }
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
})();
