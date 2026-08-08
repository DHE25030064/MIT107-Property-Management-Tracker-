document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin-dashboard';
                    } else {
                        window.location.href = '/tenant-dashboard';
                    }
                } else {
                    errorMessage.textContent = data.message || 'Login failed';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                errorMessage.textContent = 'An error occurred during login.';
                errorMessage.style.display = 'block';
                console.error(error);
            }
        });
    }
});
