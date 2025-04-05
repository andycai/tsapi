document.addEventListener('DOMContentLoaded', () => {
  // 登录表单处理
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      const errorAlert = document.getElementById('login-error');
      const successAlert = document.getElementById('login-success');
      
      errorAlert.classList.add('hide');
      successAlert.classList.add('hide');
      
      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          errorAlert.textContent = data.message || '登录失败，请检查您的凭据';
          errorAlert.classList.remove('hide');
          return;
        }
        
        successAlert.textContent = '登录成功！正在跳转...';
        successAlert.classList.remove('hide');
        
        // 成功登录后跳转到首页或个人资料页
        setTimeout(() => {
          window.location.href = '/profile';
        }, 1500);
        
      } catch (error) {
        console.error('登录出错:', error);
        errorAlert.textContent = '登录过程中发生错误，请稍后再试';
        errorAlert.classList.remove('hide');
      }
    });
  }
  
  // 注册表单处理
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      const email = document.getElementById('register-email').value;
      const errorAlert = document.getElementById('register-error');
      const successAlert = document.getElementById('register-success');
      
      errorAlert.classList.add('hide');
      successAlert.classList.add('hide');
      
      try {
        const response = await fetch('/auth/register', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, email }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          errorAlert.textContent = data.message || '注册失败，请检查您的输入';
          errorAlert.classList.remove('hide');
          return;
        }
        
        successAlert.textContent = '注册成功！请登录您的账户';
        successAlert.classList.remove('hide');
        
        // 注册成功后清空表单
        registerForm.reset();
        
        // 延迟后跳转到登录页
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
      } catch (error) {
        console.error('注册出错:', error);
        errorAlert.textContent = '注册过程中发生错误，请稍后再试';
        errorAlert.classList.remove('hide');
      }
    });
  }
}); 