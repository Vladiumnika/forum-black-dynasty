document.addEventListener('DOMContentLoaded', () => {
  // Auth-aware navbar
  const token = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const nav = document.querySelector('header nav');
  if (nav) {
    if (token && user) {
      nav.innerHTML = `
        <a href="index.html" class="nav-link">Главная</a>
        <a href="profile.html" class="nav-link">Профиль</a>
        ${user.role === 'admin' ? '<a href="admin.html" class="nav-link">Админ</a>' : ''}
        <a href="#" id="logout-link" class="nav-link">Выйти</a>
      `;
      const logout = document.getElementById('logout-link');
      if (logout) logout.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('jwt'); localStorage.removeItem('user'); window.location.href = 'index.html'; });
      const guestMsg = document.getElementById('guest-message');
      if (guestMsg) guestMsg.style.display = 'none';
    } else {
      nav.innerHTML = `
        <a href="index.html" class="nav-link">Главная</a>
        <a href="login.html" class="nav-link">Войти</a>
        <a href="register.html" class="nav-link">Регистрация</a>
      `;
    }
  }

  // --- Sidebar toggle ---
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // --- Превключване на картички/раздели ---
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
    });
  });

  // --- Глобални tooltip-и за iOS стил ---
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const tooltipText = el.getAttribute('data-tooltip');
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.innerText = tooltipText;
      el.appendChild(tooltip);
    });
    el.addEventListener('mouseleave', () => {
      const tooltip = el.querySelector('.tooltip');
      if (tooltip) tooltip.remove();
    });
  });

  // --- Локално управление на течно стъкло ефекти ---
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.backdropFilter = 'blur(12px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.backdropFilter = 'blur(6px)';
    });
  });
});
