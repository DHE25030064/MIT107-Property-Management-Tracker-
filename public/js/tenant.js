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
                    <td>${req.description}</td>
                    <td>${req.status}</td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

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
                alert('Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    });

    loadRequests();
});
