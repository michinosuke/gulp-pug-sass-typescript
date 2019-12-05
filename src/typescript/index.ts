document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const loginButton = document.querySelector('header .login');
  const logoutButton = document.querySelector('header .logout');
  loginButton.addEventListener('click', () => {
    header.classList.add('is-logged-in');
  });
  logoutButton.addEventListener('click', () => {
    header.classList.remove('is-logged-in');
  });
});
