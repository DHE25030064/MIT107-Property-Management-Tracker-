document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '/';
        return;
    }
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    const tableBody = document.getElementById('adminRequestsTableBody');

    const loadRequests = async () => {
        try {
            const response = await fetch('/api/admin/requests');
            const data = await response.json();
            
            tableBody.innerHTML = '';
            data.forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${req.id}</td>
                    <td>${req.user_id}</td>
                    <td>${req.title}</td>
                    <td>${req.description}</td>
                    <td>
                        <select class="status-select" data-id="${req.id}">
                            <option value="Pending" ${req.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${req.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${req.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-small update-btn" data-id="${req.id}">Update</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Add event listeners for update buttons
            document.querySelectorAll('.update-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const select = document.querySelector(`.status-select[data-id="${id}"]`);
                    const newStatus = select.value;
                    
                    try {
                        const res = await fetch(`/api/admin/requests/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                        });
                        
                        if (res.ok) {
                            alert('Status updated successfully');
                        } else {
                            alert('Failed to update status');
                        }
                    } catch (err) {
                        console.error('Error updating status:', err);
                    }
                });
            });

        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    loadRequests();
});
