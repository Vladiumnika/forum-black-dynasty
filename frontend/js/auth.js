// Глобальные переменные для reCAPTCHA
let recaptchaVerified = false;

// Callback функции для reCAPTCHA
window.onRecaptchaSuccess = function(token) {
  recaptchaVerified = true;
  console.log('reCAPTCHA пройден успешно');
};

window.onRecaptchaExpired = function() {
  recaptchaVerified = false;
  console.log('reCAPTCHA истек, необходимо пройти заново');
};

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Функция для создания красивых уведомлений
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `message ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '400px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = '0.75rem';
    notification.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      notification.style.transition = 'all 0.3s ease';
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Удаляем уведомление через 5 секунд
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // Функция для показа загрузки
  function showLoading(button, text = 'Загрузка...') {
    button.disabled = true;
    button.innerHTML = `<span style="display: inline-block; width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid currentColor; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></span>${text}`;
  }

  // Функция для скрытия загрузки
  function hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
  }

  // Добавляем CSS для анимации загрузки
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      const captchaResponse = grecaptcha.getResponse();
      if (!captchaResponse || !recaptchaVerified) {
        showNotification('<strong>Ошибка</strong><br>Пожалуйста, пройдите reCAPTCHA!', 'error');
        return;
      }

      showLoading(submitButton, 'Вход в систему...');

      try {
        // Отправляем данные на backend
        const formData = {
          email: loginForm.querySelector('#email').value,
          password: loginForm.querySelector('#password').value,
          recaptchaToken: captchaResponse
        };

        const response = await fetch(api('/api/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showNotification('<strong>Успешно!</strong><br>Вы успешно вошли в систему!', 'success');
          
          // Сохраняем токен
          if (result.token) {
            localStorage.setItem('jwt', result.token);
          }
          // Сохраняем краткую инфо о пользователе (роль)
          if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          
          // Перенаправляем на главную страницу через 2 секунды
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          showNotification(`<strong>Ошибка входа</strong><br>${result.message || 'Неверный email или пароль'}`, 'error');
          hideLoading(submitButton, originalText);
        }
        
      } catch (error) {
        showNotification('<strong>Ошибка входа</strong><br>Проблема с подключением к серверу', 'error');
        hideLoading(submitButton, originalText);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      const captchaResponse = grecaptcha.getResponse();
      if (!captchaResponse || !recaptchaVerified) {
        showNotification('<strong>Ошибка</strong><br>Пожалуйста, пройдите reCAPTCHA!', 'error');
        return;
      }

      // Проверка пароля
      const password = registerForm.querySelector('#password').value;
      if (password.length < 6) {
        showNotification('<strong>Ошибка</strong><br>Пароль должен содержать минимум 6 символов', 'error');
        return;
      }

      showLoading(submitButton, 'Создание аккаунта...');

      try {
        // Отправляем данные на backend
        const formData = {
          username: registerForm.querySelector('#username').value,
          email: registerForm.querySelector('#email').value,
          password: registerForm.querySelector('#password').value,
          recaptchaToken: captchaResponse
        };

        const response = await fetch(api('/api/auth/register'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showNotification('<strong>Успешно!</strong><br>Аккаунт создан! Проверьте почту для подтверждения.', 'success');
          
          // Перенаправляем на страницу подтверждения через 2 секунды
          setTimeout(() => {
            window.location.href = 'confirm.html';
          }, 2000);
        } else {
          showNotification(`<strong>Ошибка регистрации</strong><br>${result.message || 'Пользователь с таким email уже существует'}`, 'error');
          hideLoading(submitButton, originalText);
        }
        
      } catch (error) {
        showNotification('<strong>Ошибка регистрации</strong><br>Проблема с подключением к серверу', 'error');
        hideLoading(submitButton, originalText);
      }
    });
  }
});
