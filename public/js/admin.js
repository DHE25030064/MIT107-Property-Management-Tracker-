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
                    <td>${req.description.substring(0, 30)}${req.description.length > 30 ? '...' : ''}</td>
                    <td>
                        <select class="status-select" data-id="${req.id}">
                            <option value="Pending" ${req.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${req.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${req.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-small update-btn" data-id="${req.id}">Update</button>
                        <button class="btn-small delete-btn" data-id="${req.id}" style="background-color: #dc3545; margin-top: 5px; width: 100%;">Delete</button>
                        <a href="/request-details?id=${req.id}" class="btn-small" style="text-decoration: none; display: inline-block; margin-top: 5px; background-color: #17a2b8; text-align: center; width: 100%; box-sizing: border-box;">View</a>
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

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (!confirm('Are you sure you want to delete this request?')) return;
                    
                    const id = e.target.getAttribute('data-id');
                    try {
                        const res = await fetch(`/api/requests/${id}?userId=${user.id}&role=${user.role}`, {
                            method: 'DELETE'
                        });
                        if (res.ok) {
                            loadRequests();
                        } else {
                            const data = await res.json();
                            alert(data.message || 'Failed to delete request');
                        }
                    } catch (err) {
                        console.error('Error deleting request:', err);
                        alert('Error deleting request');
                    }
                });
            });

        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    loadRequests();
});
