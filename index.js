document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');

    loginBtn.addEventListener('click', () => {
        window.location.href = 'https://auth.liaa.app';
    });
});