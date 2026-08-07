document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Authentication will be implemented in Day 2
            console.log('Login form submitted');
            errorMessage.textContent = 'Authentication is not yet implemented (Day 2 task).';
            errorMessage.style.display = 'block';
        });
    }
});
