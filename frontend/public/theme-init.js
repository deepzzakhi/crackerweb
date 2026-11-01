// Aplica el tema guardado antes de que se pinte la página (evita el destello oscuro en modo claro).
// Va como archivo aparte porque la CSP no permite scripts inline.
(function () {
  try {
    var t = localStorage.getItem('cracker-theme')
    if (t !== 'light' && t !== 'dark') t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    document.documentElement.classList.toggle('light', t === 'light')
  } catch (e) { /* sin acceso a localStorage: queda el oscuro */ }
})()
