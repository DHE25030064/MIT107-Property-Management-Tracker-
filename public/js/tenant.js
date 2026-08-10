document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'tenant') {
        window.location.href = '/';
        return;
    }
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    const requestForm = document.getElementById('requestForm');
    const tableBody = document.getElementById('requestsTableBody');

    const loadRequests = async () => {
        try {
            const response = await fetch(`/api/tenant/requests?userId=${user.id}`);
            const data = await response.json();
            
            tableBody.innerHTML = '';
            data.forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${req.id}</td>
                    <td>${req.title}</td>
                    <td>${req.description.substring(0, 30)}${req.description.length > 30 ? '...' : ''}</td>
                    <td>${req.status}</td>
                    <td><a href="/request-details?id=${req.id}" class="btn-small" style="text-decoration: none;">View</a></td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const errorMessage = document.getElementById('formErrorMessage');

        if (title.length < 5 || description.length < 10) {
            errorMessage.textContent = 'Title must be at least 5 characters and description 10 characters.';
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';

        try {
            const response = await fetch('/api/tenant/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, userId: user.id })
            });

            if (response.ok) {
                requestForm.reset();
                loadRequests();
            } else {
                const data = await response.json();
                errorMessage.textContent = data.message || 'Failed to submit request';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            errorMessage.textContent = 'An error occurred while submitting.';
            errorMessage.style.display = 'block';
        }
    });

    loadRequests();
});
