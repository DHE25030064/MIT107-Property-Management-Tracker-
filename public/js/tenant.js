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
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    let editRequestId = null;

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editRequestId = null;
            requestForm.reset();
            submitBtn.textContent = 'Submit Request';
            cancelEditBtn.style.display = 'none';
        });
    }

    const loadRequests = async () => {
        try {
            const response = await fetch(`/api/tenant/requests?userId=${user.id}`);
            const data = await response.json();
            
            tableBody.innerHTML = '';
            data.forEach(req => {
                const tr = document.createElement('tr');
                let actions = `<a href="/request-details?id=${req.id}" class="btn-small" style="text-decoration: none;">View</a>`;
                
                if (req.status === 'Pending') {
                    actions += `
                        <button class="btn-small edit-btn" data-id="${req.id}" data-title="${req.title}" data-desc="${req.description}" style="background-color: #ffc107; color: black; margin-left: 5px;">Edit</button>
                        <button class="btn-small delete-btn" data-id="${req.id}" style="background-color: #dc3545; margin-left: 5px;">Delete</button>
                    `;
                }

                tr.innerHTML = `
                    <td>${req.id}</td>
                    <td>${req.title}</td>
                    <td>${req.description.substring(0, 30)}${req.description.length > 30 ? '...' : ''}</td>
                    <td>${req.status}</td>
                    <td>${actions}</td>
                `;
                tableBody.appendChild(tr);
            });

            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const title = e.target.getAttribute('data-title');
                    const desc = e.target.getAttribute('data-desc');
                    
                    document.getElementById('title').value = title;
                    document.getElementById('description').value = desc;
                    editRequestId = id;
                    submitBtn.textContent = 'Update Request';
                    cancelEditBtn.style.display = 'inline-block';
                    window.scrollTo(0, 0);
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
            const url = editRequestId ? `/api/tenant/requests/${editRequestId}` : '/api/tenant/requests';
            const method = editRequestId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, userId: user.id })
            });

            if (response.ok) {
                requestForm.reset();
                if (editRequestId) {
                    editRequestId = null;
                    submitBtn.textContent = 'Submit Request';
                    cancelEditBtn.style.display = 'none';
                }
                loadRequests();
            } else {
                const data = await response.json();
                errorMessage.textContent = data.message || (editRequestId ? 'Failed to update request' : 'Failed to submit request');
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
